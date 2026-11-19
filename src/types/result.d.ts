import type { DiffOperation } from './operation';
import type { DiffToken } from './token';


export interface DiffResult< T extends Record< string, unknown > = {} > {
  readonly original: ReadonlyArray< DiffToken< T > >;
  readonly modified: ReadonlyArray< DiffToken< T > >;
  readonly operations: ReadonlyArray< DiffOperation >;
}
