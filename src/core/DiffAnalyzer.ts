import type { DiffCharacterCounts, DiffCharacterStats, DiffMetricStats, DiffOperationStats, DiffTokenStats } from '../types/analyze';
import type { DiffResult } from '../types/result';
import type { DiffToken } from '../types/token';


export class DiffAnalyzer< T extends Record< string, unknown > = {} > {
  private readonly result: DiffResult< T >;
  private tokenStats?: DiffTokenStats;
  private characterStats?: DiffCharacterStats;
  private operationStats?: DiffOperationStats;
  private encoder?: TextEncoder;

  public constructor ( result: DiffResult< T > ) {
    this.result = result;
  }
}
