import type { DiffOperation } from './operation';
import type { DiffToken } from './token';


export interface DiffResult< T extends Record< string, unknown > = {} > {
  readonly original: readonly DiffToken< T >[];
  readonly modified: readonly DiffToken< T >[];
  readonly operations: readonly DiffOperation[];
}
