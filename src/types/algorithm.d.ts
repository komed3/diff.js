import type { Sequence } from './context';
import type { Operation } from './operation';


export interface Algorithm {
  diff < T > ( seq: Sequence< T > ) : Operation[];
}
