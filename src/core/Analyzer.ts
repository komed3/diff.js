import type { CharacterCounts, CharacterStats, MetricStats, OperationStats, TokenStats } from '../types/analyze';
import type { Result } from '../types/result';


export class Analyzer< T extends Record< string, unknown > = {} > {
  private readonly result: Result< T >;
  private tokenStats?: TokenStats;
  private characterStats?: CharacterStats;
  private operationStats?: OperationStats;
  private encoder?: TextEncoder;

  private stats ( original: number, modified: number, equal: number, inserted: number, deleted: number ) : MetricStats {
    const changed = inserted + deleted, total = original + modified;

    return {
      original, modified, equal, inserted, deleted, changed, delta: modified - original,
      changeRate: total === 0 ? 0 : changed / total,
      insertionRate: modified === 0 ? 0 : inserted / modified,
      deletionRate: original === 0 ? 0 : deleted / original,
      retentionRate: original === 0 ? 0 : equal / original,
      similarity: total === 0 ? 1 : 1 - changed / total,
      growthRate: original === 0 ? null : ( modified - original ) / original,
      sizeRatio: original === 0 ? null : modified / original
    };
  }

  public constructor ( result: Result< T > ) {
    this.result = result;
  }

  public getTokenStats () : TokenStats {
    return this.tokenStats ??= ( () => {
      const { original: o, modified: m, operations } = this.result;
      let equal = 0, ins = 0, del = 0;

      for ( const { type, original, modified } of operations ) {
        if ( type === 'equal' ) equal += original.length;
        else if ( type === 'insert' ) ins += modified.length;
        else del += original.length;
      }

      return this.stats( o.length, m.length, equal, ins, del );
    } )();
  }

  public getCharacterStats () : CharacterStats {
    return this.characterStats ??= ( () => {
      const add = ( counts: CharacterCounts, v: string ) : void => {
        counts.utf16CodeUnits += v.length;
        counts.utf8Bytes += ( this.encoder ??= new TextEncoder() ).encode( v ).length;

        for ( const _ of v ) counts.unicodeCodePoints++;
      };

      const process = ( s: number, l: number, counts: CharacterCounts, key: 'modified' | 'original' ) => {
        for ( let i = s; i < s + l; i++ ) add( counts, this.result[ key ][ i ].value );
      };

      const stats = {
        o: { utf16CodeUnits: 0, unicodeCodePoints: 0, utf8Bytes: 0 },
        m: { utf16CodeUnits: 0, unicodeCodePoints: 0, utf8Bytes: 0 },
        e: { utf16CodeUnits: 0, unicodeCodePoints: 0, utf8Bytes: 0 },
        i: { utf16CodeUnits: 0, unicodeCodePoints: 0, utf8Bytes: 0 },
        d: { utf16CodeUnits: 0, unicodeCodePoints: 0, utf8Bytes: 0 }
      };

      for ( const { type, original, modified } of this.result.operations ) {
        if ( type !== 'insert' ) process( original.start, original.length, stats.o, 'original' );
        if ( type === 'equal' ) process( original.start, original.length, stats.e, 'original' );
        if ( type === 'delete' ) process( original.start, original.length, stats.d, 'original' );
        if ( type !== 'delete' ) process( modified.start, modified.length, stats.m, 'modified' );
        if ( type === 'insert' ) process( modified.start, modified.length, stats.i, 'modified' );
      }

      return {
        utf16CodeUnits: this.stats(
          stats.o.utf16CodeUnits, stats.m.utf16CodeUnits, stats.e.utf16CodeUnits,
          stats.i.utf16CodeUnits, stats.d.utf16CodeUnits
        ),
        unicodeCodePoints: this.stats(
          stats.o.unicodeCodePoints, stats.m.unicodeCodePoints, stats.e.unicodeCodePoints,
          stats.i.unicodeCodePoints, stats.d.unicodeCodePoints
        ),
        utf8Bytes: this.stats(
          stats.o.utf8Bytes, stats.m.utf8Bytes, stats.e.utf8Bytes,
          stats.i.utf8Bytes, stats.d.utf8Bytes
        )
      };
    } )();
  }

  public getOperationStats () : OperationStats {
    return this.operationStats ??= ( () => {
      const stats = {
        total: this.result.operations.length, equal: 0, insert: 0, delete: 0,
        changes: 0, changeBlocks: 0, insertionBlocks: 0, deletionBlocks: 0,
        replacementBlocks: 0, insertionOnlyBlocks: 0, deletionOnlyBlocks: 0
      };

      let inBlock = false, hasInsert = false, hasDelete = false;

      const finishBlock = () => {
        if ( ! inBlock ) return;

        stats.changeBlocks++;

        if ( hasInsert ) stats.insertionBlocks++;
        if ( hasDelete ) stats.deletionBlocks++;
        if ( hasInsert && hasDelete ) stats.replacementBlocks++;
        else if ( hasInsert ) stats.insertionOnlyBlocks++;
        else if ( hasDelete ) stats.deletionOnlyBlocks++;

        inBlock = hasInsert = hasDelete = false;
      };

      for ( const { type } of this.result.operations ) {
        if ( type === 'equal' ) stats.equal++, finishBlock();
        else {
          stats.changes++, inBlock = true;

          if ( type === 'insert' ) stats.insert++, hasInsert = true;
          else stats.delete++, hasDelete = true;
        }
      }

      finishBlock();
      return stats;
    } )();
  }
}
