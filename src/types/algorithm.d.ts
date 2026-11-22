import type { Input } from './context';
import type { Operation } from './operation';


export interface Algorithm {
  diff < T > ( input: Input< T > ) : Operation[];
}
