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

  public constructor ( result: DiffResult< T > ) {
    this.result = result;
  }

  public getTokenStats () : DiffTokenStats {
    return this.tokenStats ??= ( () => {
      let equal = 0, inserted = 0, deleted = 0;

      for ( const operation of this.result.operations ) {
        if ( operation.type === 'equal' ) equal += operation.original.length;
        else if ( operation.type === 'insert' ) inserted += operation.modified.length;
        else deleted += operation.original.length;
      }

      return this.createMetricStats(
        this.result.original.length,
        this.result.modified.length,
        equal,
        inserted,
        deleted
      );
    } )();
  }
}
