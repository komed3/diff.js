import type { DiffCharacterCounts, DiffCharacterStats, DiffMetricStats, DiffOperationStats, DiffTokenStats } from '../types/analyze';
import type { DiffResult } from '../types/result';
import type { DiffToken } from '../types/token';


export class DiffAnalyzer< T extends Record< string, unknown > = {} > {
  private readonly result: DiffResult< T >;
  private tokenStats?: DiffTokenStats;
  private characterStats?: DiffCharacterStats;
  private operationStats?: DiffOperationStats;
  private encoder?: TextEncoder;

  private createMetricStats ( original: number, modified: number, equal: number, ins: number, del: number ) : DiffMetricStats {
    const changed = ins + del, total = original + modified;

    return {
      original, modified, equal, inserted: ins, deleted: del, changed, delta: modified - original,
      changeRate: total === 0 ? 0 : changed / total,
      insertionRate: modified === 0 ? 0 : ins / modified,
      deletionRate: original === 0 ? 0 : del / original,
      retentionRate: original === 0 ? 0 : equal / original,
      similarity: total === 0 ? 1 : 1 - changed / total,
      growthRate: original === 0 ? null : ( modified - original ) / original,
      sizeRatio: original === 0 ? null : modified / original
    };
  }

  public constructor ( result: DiffResult< T > ) {
    this.result = result;
  }

  public getTokenStats () : DiffTokenStats {
    return this.tokenStats ??= ( () => {
      const { original: o, modified: m, operations } = this.result;
      let equal = 0, ins = 0, del = 0;

      for ( const { type, original, modified } of operations ) {
        if ( type === 'equal' ) equal += original.length;
        else if ( type === 'insert' ) ins += modified.length;
        else del += original.length;
      }

      return this.createMetricStats( o.length, m.length, equal, ins, del );
    } )();
  }

  public getCharacterStats () : DiffCharacterStats {
    return this.characterStats ??= ( () => {
      const add = ( counts: DiffCharacterCounts, value: string ) : void => {
        counts.utf16CodeUnits += value.length;
        counts.unicodeCodePoints += value.length;
        counts.utf8Bytes += ( this.encoder ??= new TextEncoder() ).encode( value ).length;
      };

      const process = ( start: number, length: number, counts: DiffCharacterCounts, key: 'modified' | 'original' ) => {
        for ( let i = start; i < start + length; i++ ) add( counts, this.result[ key ][ i ].value );
      };

      const stats = {
        o: { utf16CodeUnits: 0, unicodeCodePoints: 0, utf8Bytes: 0 } as DiffCharacterCounts,
        m: { utf16CodeUnits: 0, unicodeCodePoints: 0, utf8Bytes: 0 } as DiffCharacterCounts,
        e: { utf16CodeUnits: 0, unicodeCodePoints: 0, utf8Bytes: 0 } as DiffCharacterCounts,
        i: { utf16CodeUnits: 0, unicodeCodePoints: 0, utf8Bytes: 0 } as DiffCharacterCounts,
        d: { utf16CodeUnits: 0, unicodeCodePoints: 0, utf8Bytes: 0 } as DiffCharacterCounts
      };

      for ( const { type, original, modified } of this.result.operations ) {
        if ( type !== 'insert' ) process( original.start, original.length, stats.o, 'original' );
        if ( type === 'equal' ) process( original.start, original.length, stats.e, 'original' );
        if ( type === 'delete' ) process( original.start, original.length, stats.d, 'original' );
        if ( type !== 'delete' ) process( modified.start, modified.length, stats.m, 'modified' );
        if ( type === 'insert' ) process( modified.start, modified.length, stats.i, 'modified' );
      }

      return {
        utf16CodeUnits: this.createMetricStats(
          stats.o.utf16CodeUnits, stats.m.utf16CodeUnits, stats.e.utf16CodeUnits,
          stats.i.utf16CodeUnits, stats.d.utf16CodeUnits
        ),
        unicodeCodePoints: this.createMetricStats(
          stats.o.unicodeCodePoints, stats.m.unicodeCodePoints, stats.e.unicodeCodePoints,
          stats.i.unicodeCodePoints, stats.d.unicodeCodePoints
        ),
        utf8Bytes: this.createMetricStats(
          stats.o.utf8Bytes, stats.m.utf8Bytes, stats.e.utf8Bytes,
          stats.i.utf8Bytes, stats.d.utf8Bytes
        )
      };
    } )();
  }
}
