import type { Operation } from './operation';
import type { Token } from './token';


export interface Algorithm {
  diff < T extends Record< string, unknown > = {} > (
    original: readonly Token< T >[],
    modified: readonly Token< T >[]
  ) : Operation[];
}
