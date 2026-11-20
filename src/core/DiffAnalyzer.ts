import type { DiffCharacterCounts, DiffCharacterStats, DiffMetricStats, DiffOperationStats, DiffTokenStats } from '../types/analyze';
import type { DiffResult } from '../types/result';
import type { DiffToken } from '../types/token';


export class DiffAnalyzer< T extends Record< string, unknown > = {} > {
  private readonly result: DiffResult< T >;
  private tokenStats?: DiffTokenStats;
  private characterStats?: DiffCharacterStats;
  private operationStats?: DiffOperationStats;
  private encoder?: TextEncoder;

  private createMetricStats ( original: number, modified: number, equal: number, inserted: number, deleted: number ) : DiffMetricStats {
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

  private addCharacterCounts ( counts: DiffCharacterCounts, value: string ) : void {
    counts.utf16CodeUnits += value.length;
    for ( const _ of value ) counts.unicodeCodePoints++;
    counts.utf8Bytes += ( this.encoder ??= new TextEncoder() ).encode( value ).length;
  }

  public constructor ( result: DiffResult< T > ) {
    this.result = result;
  }

  public getTokenStats () : DiffTokenStats {
    return this.tokenStats ??= ( () => {
      const { original: o, modified: m, operations } = this.result;
      let equal = 0, inserted = 0, deleted = 0;

      for ( const { type, original, modified } of operations ) {
        if ( type === 'equal' ) equal += original.length;
        else if ( type === 'insert' ) inserted += modified.length;
        else deleted += original.length;
      }

      return this.createMetricStats( o.length, m.length, equal, inserted, deleted );
    } )();
  }

  public getCharacterStats () : DiffCharacterStats {
    return this.characterStats ??= ( () => {
      const original: DiffCharacterCounts = { utf16CodeUnits: 0, unicodeCodePoints: 0, utf8Bytes: 0 };
      const modified: DiffCharacterCounts = { utf16CodeUnits: 0, unicodeCodePoints: 0, utf8Bytes: 0 };
      const equal: DiffCharacterCounts = { utf16CodeUnits: 0, unicodeCodePoints: 0, utf8Bytes: 0 };
      const inserted: DiffCharacterCounts = { utf16CodeUnits: 0, unicodeCodePoints: 0, utf8Bytes: 0 };
      const deleted: DiffCharacterCounts = { utf16CodeUnits: 0, unicodeCodePoints: 0, utf8Bytes: 0 };

      for ( const { type, original: source, modified: target } of this.result.operations ) {
        if ( type !== 'insert' ) for ( let i = source.start; i < source.start + source.length; i++ ) {
          const value = this.result.original[ i ].value;
          this.addCharacterCounts( original, value );

          if ( type === 'equal' ) this.addCharacterCounts( equal, value );
          if ( type === 'delete' ) this.addCharacterCounts( deleted, value );
        }

        if ( type !== 'delete' ) for ( let i = target.start; i < target.start + target.length; i++ ) {
          const value = this.result.modified[ i ].value;
          this.addCharacterCounts( modified, value );

          if ( type === 'insert' ) this.addCharacterCounts( inserted, value );
        }
      }

      return {
        utf16CodeUnits: this.createMetricStats(
          original.utf16CodeUnits, modified.utf16CodeUnits, equal.utf16CodeUnits,
          inserted.utf16CodeUnits, deleted.utf16CodeUnits
        ),
        unicodeCodePoints: this.createMetricStats(
          original.unicodeCodePoints, modified.unicodeCodePoints, equal.unicodeCodePoints,
          inserted.unicodeCodePoints, deleted.unicodeCodePoints
        ),
        utf8Bytes: this.createMetricStats(
          original.utf8Bytes, modified.utf8Bytes, equal.utf8Bytes,
          inserted.utf8Bytes, deleted.utf8Bytes
        )
      };
    } )();
  }
}
