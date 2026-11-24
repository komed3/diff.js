import type {
  CharacterBaseMetric, CharacterCounts, CharacterMetric, CharacterStats,
  MetricBaseStats, MetricStats,
  TokenStats
} from '../types/analyze';
import type { Result } from '../types/engine';


export class Analyzer {
  private encoder?: TextEncoder;

  private metric ( { original, modified, equal, inserted, deleted, changed }: MetricBaseStats ) : MetricStats {
    const delta = modified - original, size = Math.max( original, modified );

    return {
      original, modified, equal, inserted, deleted, changed, delta,
      changeRate: size === 0 ? 0 : ( inserted + deleted + changed ) / size,
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

  private add ( target: CharacterCounts, text: string ) : void {
    const { utf16CodeUnits, unicodeCodePoints, utf8Bytes } = this.counts( text );

    target.utf16CodeUnits += utf16CodeUnits;
    target.unicodeCodePoints += unicodeCodePoints;
    target.utf8Bytes += utf8Bytes;
  }

  private charMetric ( { original, modified, equal, inserted, deleted, changed }: CharacterBaseMetric ) : CharacterMetric {
    return {
      original, modified, equal, inserted, deleted, changed, delta: modified - original,
      changeRate: original + modified === 0 ? 0 : ( inserted + deleted + changed.original +
        changed.modified ) / ( original + modified )
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
    const stats = Object.fromEntries(
      [ 'utf16CodeUnits', 'unicodeCodePoints', 'utf8Bytes' ].map( key => [ key, {
        original: 0, modified: 0, equal: { original: 0, modified: 0 },
        inserted: 0, deleted: 0, changed: { original: 0, modified: 0 }
      } ] )
    );

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
      lines: 0, original: 0, modified: 0, equal: 0, inserted: 0,
      deleted: 0, changed: { original: 0, modified: 0 }
    };

    for ( const { edit } of this.result.script ) {
      if ( ! edit ) continue;

      stats.lines++;
      stats.original += edit.original.length;
      stats.modified += edit.modified.length;
      let inserted = 0, deleted = 0;

      for ( const { type, original, modified } of edit.operations ) {
        if ( type === 'equal' ) stats.equal += original.length;
        else if ( type === 'insert' ) inserted += modified.length;
        else deleted += original.length;
      }

      const changed = Math.min( inserted, deleted );
      stats.changed.original += changed, stats.changed.modified += changed;
      stats.inserted += inserted - changed, stats.deleted += deleted - changed;
    }

    const { lines, original, modified, changed, ...s } = stats;
    const changedTotal = changed.original + changed.modified;
    const changedLines = this.lines().changed;

    return {
      lines, original, modified, changed, ...s, delta: modified - original,
      coverage: changedLines === 0 ? 0 : lines / changedLines,
      changeRate: original + modified === 0 ? 0 : changedTotal / ( original + modified )
    };
  }
}
