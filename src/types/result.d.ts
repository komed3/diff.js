import type { Operation } from './operation';
import type { Token } from './token';


export interface Result< T extends Record< string, unknown > = {} > {
  readonly original: readonly Token< T >[];
  readonly modified: readonly Token< T >[];
  readonly operations: readonly Operation[];
}
