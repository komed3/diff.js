import type {
  Block, BlockBase, BlockDistribution, BlockType, CharacterBaseMetric, CharacterCounts,
  CharacterMetric, CharacterStats, DistributionStats, MetricBaseStats, MetricStats,
  OperationStats, PatternMagnitude, PatternRun, PatternSequence, PatternStats, PatternType,
  SideDistribution, TokenStats
} from '../types/analyze';
import type { Result } from '../types/engine';


export class Analyzer {
  private encoder?: TextEncoder;

  private metric ( { original, modified, equal, inserted, deleted, changed }: MetricBaseStats ) : MetricStats {
    const delta = modified - original, size = original + modified;

    return {
      original, modified, equal, inserted, deleted, changed, delta,
      changeRate: size === 0 ? 0 : ( inserted + deleted + changed * 2 ) / size,
      insertionRate: modified === 0 ? 0 : inserted / modified,
      deletionRate: original === 0 ? 0 : deleted / original,
      retentionRate: original === 0 ? 0 : equal / original,
      growthRate: original === 0 ? null : delta / original,
      sizeRatio: original === 0 ? null : modified / original
    };
  }

  private counts ( text: string ) : CharacterCounts {
    let unicodeCodePoints = 0;
    for ( const _ of text ) unicodeCodePoints++;

    return {
      utf16CodeUnits: text.length, unicodeCodePoints,
      utf8Bytes: ( this.encoder ??= new TextEncoder() ).encode( text ).length
    };
  }

  private charMetric ( { original, modified, equal, inserted, deleted, changed }: CharacterBaseMetric ) : CharacterMetric {
    return {
      original, modified, equal, inserted, deleted, changed, delta: modified - original,
      changeRate: original + modified === 0 ? 0 : ( inserted + deleted + changed.original +
        changed.modified ) / ( original + modified )
    };
  }

  private side ( blocks: Block[], side: 'original' | 'modified', total: number ) : SideDistribution {
    const r = blocks.map( ( { [ side ]: range } ) => range ).filter( ( { length } ) => length > 0 )
      .sort( ( a, b ) => a.start - b.start );

    const affected = r.reduce( ( sum, { length } ) => sum + length, 0 );
    const gaps = r.slice( 1 ).map( ( range, i ) => range.start - ( r[ i ].start + r[ i ].length ) );
    const first = r[ 0 ], last = r[ r.length - 1 ], coverage = first && last ? last.start + last.length - first.start : 0;
    const min = gaps.reduce( ( value, gap ) => Math.min( value, gap ), Infinity );
    const max = gaps.reduce( ( value, gap ) => Math.max( value, gap ), 0 );
    const sum = gaps.reduce( ( value, gap ) => value + gap, 0 );

    return {
      density: total === 0 ? 0 : affected / total,
      coverage: total === 0 ? 0 : coverage / total,
      affected, gaps: {
        count: gaps.length, min: gaps.length ? min : 0, max,
        average: gaps.length ? sum / gaps.length : 0
      }
    };
  }

  public constructor ( private readonly result: Result ) {}

  public lines () : MetricStats {
    const stats = { original: 0, modified: 0, equal: 0, inserted: 0, deleted: 0, changed: 0 };

    for ( const { operation: { type, original, modified } } of this.result.script ) {
      const ol = original.length, ml = modified.length;

      if ( type !== 'insert' ) stats.original += ol;
      if ( type !== 'delete' ) stats.modified += ml;

      if ( type === 'equal' ) stats.equal += ol;
      else if ( type === 'insert' ) stats.inserted += ml;
      else if ( type === 'delete' ) stats.deleted += ol;
      else stats.changed += Math.max( ol, ml );
    }

    return this.metric( stats );
  }

  public characters () : CharacterStats {
    const stats = Object.fromEntries( [ 'utf16CodeUnits', 'unicodeCodePoints', 'utf8Bytes' ].map(
      key => [ key, {
        original: 0, modified: 0, equal: { original: 0, modified: 0 },
        inserted: 0, deleted: 0, changed: { original: 0, modified: 0 }
      } ]
    ) );

    for ( const { original, modified, operation: { type } } of this.result.script ) {
      const old = this.counts( original ? original.value + original.ending : '' );
      const neu = this.counts( modified ? modified.value + modified.ending : '' );

      for ( const key of [ 'utf16CodeUnits', 'unicodeCodePoints', 'utf8Bytes' ] as const ) {
        const target = stats[ key ], o = old[ key ], m = neu[ key ];

        if ( original ) target.original += o;
        if ( modified ) target.modified += m;

        if ( type === 'equal' ) target.equal.original += o, target.equal.modified += m;
        else if ( type === 'insert' ) target.inserted += m;
        else if ( type === 'delete' ) target.deleted += o;
        else target.changed.original += o, target.changed.modified += m;
      }
    }

    return {
      utf16CodeUnits: this.charMetric( stats.utf16CodeUnits ),
      unicodeCodePoints: this.charMetric( stats.unicodeCodePoints ),
      utf8Bytes: this.charMetric( stats.utf8Bytes )
    };
  }

  public tokens () : TokenStats {
    const stats = {
      lines: 0, original: 0, modified: 0, equal: 0, inserted: 0, deleted: 0,
      changed: { original: 0, modified: 0 }, blocks: 0, largestBlock: 0
    };

    for ( const { edit } of this.result.script ) {
      if ( ! edit ) continue;

      stats.lines++;
      stats.original += edit.original.length;
      stats.modified += edit.modified.length;
      let inserted = 0, deleted = 0, block = 0;

      const finish = () => {
        if ( ! block ) return;
        stats.blocks++;
        stats.largestBlock = Math.max( stats.largestBlock, block );
        block = 0;
      };

      for ( const { type, original, modified } of edit.operations ) {
        if ( type === 'equal' ) stats.equal += original.length, finish();
        else {
          block += Math.max( original.length, modified.length );
          if ( type === 'insert' ) inserted += modified.length;
          else deleted += original.length;
        }
      }

      finish();

      const changed = Math.min( inserted, deleted );
      stats.changed.original += changed, stats.changed.modified += changed;
      stats.inserted += inserted - changed, stats.deleted += deleted - changed;
    }

    const { lines, original, modified, changed, blocks, largestBlock, ...s } = stats;
    const changedLines = this.lines().changed;

    return {
      lines, original, modified, changed, ...s, blocks, largestBlock,
      delta: modified - original, coverage: changedLines === 0 ? 0 : lines / changedLines,
      changeRate: original + modified === 0 ? 0 : ( stats.inserted + stats.deleted +
        changed.original + changed.modified ) / ( original + modified ),
      averageBlockSize: blocks === 0 ? 0 : ( blocks ? stats.largestBlock : 0 )
    };
  }

  public blocks () : Block[] {
    const blocks: Block[] = [];
    let curr: BlockBase | null = null;

    const finish = () => {
      if ( ! curr ) return;

      const { original, modified, insert, delete: del, change } = curr;
      const type: BlockType = insert && del ? ( change ? 'mixed' : 'replace' ) : insert ?
        ( change ? 'mixed' : 'insert' ) : del ? ( change ? 'mixed' : 'delete' ) : 'change';

      blocks.push( {
        type, original, modified, insert, delete: del, change,
        size: Math.max( original.length, modified.length ),
        churn: original.length + modified.length
      } );

      curr = null;
    };

    for ( const { operation: { type, original, modified } } of this.result.script ) {
      if ( type === 'equal' ) { finish(); continue }

      if ( ! curr ) curr = {
        original: { start: original.start, length: 0 },
        modified: { start: modified.start, length: 0 },
        insert: 0, delete: 0, change: 0
      };

      curr.original = { ...curr.original, length: Math.max(
        curr.original.length, original.start + original.length - curr.original.start
      ) };

      curr.modified = { ...curr.modified, length: Math.max(
        curr.modified.length, modified.start + modified.length - curr.modified.start
      ) };

      if ( type === 'insert' ) curr.insert++;
      else if ( type === 'delete' ) curr.delete++;
      else curr.change++;
    }

    finish();
    return blocks;
  }

  public operations () : OperationStats {
    const stats = {
      total: this.result.script.length, equal: 0, insert: 0, delete: 0, change: 0, changes: 0,
      changeBlocks: 0, insertionBlocks: 0, deletionBlocks: 0, replacementBlocks: 0,
      insertionOnlyBlocks: 0, deletionOnlyBlocks: 0, changeOnlyBlocks: 0, mixedBlocks: 0
    };

    for ( const { type, insert, delete: del } of this.blocks() ) {
      stats.changeBlocks++;

      if ( insert ) stats.insertionBlocks++;
      if ( del ) stats.deletionBlocks++;

      if ( type === 'insert' ) stats.insertionOnlyBlocks++;
      else if ( type === 'delete' ) stats.deletionOnlyBlocks++;
      else if ( type === 'replace' ) stats.replacementBlocks++;
      else if ( type === 'change' ) stats.changeOnlyBlocks++;
      else stats.mixedBlocks++;
    }

    for ( const { operation: { type } } of this.result.script ) {
      if ( type === 'equal' ) stats.equal++;
      else if ( type === 'insert' ) stats.insert++, stats.changes++;
      else if ( type === 'delete' ) stats.delete++, stats.changes++;
      else stats.change++, stats.changes++;
    }

    return stats;
  }

  public patterns () : PatternStats {
    const types = this.result.script.map( ( { operation: { type } } ) => type );
    const transitions: Record< string, number > = {}, seq: Record< string, number > = {};
    const longest: Record< PatternType, number > = { equal: 0, insert: 0, delete: 0, change: 0 };
    const runs: PatternRun[] = [];

    const magnitude = Object.fromEntries( [ 'equal', 'insert', 'delete', 'change' ].map(
      key => [ key, { runs: 0, lines: 0, longest: 0, average: 0 } ]
    ) ) as Record< PatternType, PatternMagnitude >;

    for ( let i = 0; i < types.length; i++ ) {
      const type = types[ i ];
      let length = 1;

      while ( types[ i + length ] === type ) length++;

      runs.push( { type, start: i, length } );
      longest[ type ] = Math.max( longest[ type ], length );
      magnitude[ type ].runs++;
      magnitude[ type ].lines += length;
      magnitude[ type ].longest = Math.max( magnitude[ type ].longest, length );
      i += length - 1;
    }

    for ( const m of Object.values( magnitude ) ) m.average = m.runs === 0 ? 0 : m.lines / m.runs;

    for ( let i = 1; i < types.length; i++ ) {
      const key = `${ types[ i - 1 ] }>${ types[ i ] }`;
      transitions[ key ] = ( transitions[ key ] ?? 0 ) + 1;
    }

    for ( const length of [ 2, 3 ] ) for ( let i = 0; i <= types.length - length; i++ ) {
      const pattern = types.slice( i, i + length ).join( '>' );
      seq[ pattern ] = ( seq[ pattern ] ?? 0 ) + 1;
    }

    const sequences: PatternSequence[] = Object.entries( seq )
      .filter( ( [ , count ] ) => count > 1 )
      .map( ( [ pattern, count ] ) => ( { pattern, length: pattern.split( '>' ).length, count } ) )
      .sort( ( a, b ) => b.count - a.count || a.pattern.localeCompare( b.pattern ) );

    return { transitions, sequences, runs, longest, magnitude };
  }

  public distribution () : DistributionStats {
    const blocks = this.blocks(), sizes = blocks.map( ( { size } ) => size );
    const changed = sizes.reduce( ( sum, size ) => sum + size, 0 );
    const largest = sizes.reduce( ( max, size ) => Math.max( max, size ), 0 );
    const { original, modified } = this.lines();

    const byType = Object.fromEntries( [ 'insert', 'delete', 'replace', 'change', 'mixed' ].map(
      key => [ key, { count: 0, size: 0, churn: 0, largest: 0, average: 0 } ]
    ) ) as Record< BlockType, BlockDistribution >;

    for ( const { type, size, churn } of blocks ) {
      const stats = byType[ type ];
      stats.count++, stats.size += size, stats.churn += churn;
      stats.largest = Math.max( stats.largest, size );
    }

    for ( const t of Object.values( byType ) ) t.average = t.count === 0 ? 0 : t.size / t.count;

    return {
      original: this.side( blocks, 'original', original ),
      modified: this.side( blocks, 'modified', modified ),
      byType, blockCount: blocks.length, largestBlock: largest,
      concentration: changed === 0 ? 0 : largest / changed,
      averageBlockSize: blocks.length ? changed / blocks.length : 0
    };
  }
}
