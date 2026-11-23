import type { Comparable, Sequence } from './context';
import type { Operation } from './operation';


export interface Algorithm {
  diff < T extends Comparable > ( seq: Sequence< T > ) : Operation[];
}
