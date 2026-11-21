import type { Operation } from './operation';


export interface Algorithm {
  diff < T > ( original: readonly T[], modified: readonly T[] ) : Operation[];
}