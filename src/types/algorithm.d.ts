import type { DiffOperation } from './operation';
import type { DiffToken } from './token';


export interface DiffAlgorithm {
  diff < T extends Record< string, unknown > = {} > (
    original: readonly DiffToken< T >[],
    modified: readonly DiffToken< T >[]
  ) : DiffOperation[];
}
