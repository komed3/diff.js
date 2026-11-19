import type { DiffAlgorithm } from '../types/algorithm';
import type { DiffOperation, DiffOperationType } from '../types/operation';
import type { DiffToken } from '../types/token';


export class MyersAlgorithm implements DiffAlgorithm {
  public diff < T extends Record< string, unknown > = {} > (
    original: readonly DiffToken< T >[],
    modified: readonly DiffToken< T >[]
  ) : DiffOperation[] {}
}
