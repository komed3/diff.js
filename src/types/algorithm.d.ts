import type { Operation } from './operation';


export interface DiffAlgorithm {
  diff < T > (
    original: readonly T[],
    modified: readonly T[],
    equals: ( original: T, modified: T ) => boolean
  ) : Operation[];
}
