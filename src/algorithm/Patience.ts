import type { Algorithm } from '../types/algorithm';
import type { Operation } from '../types/operation';


export class Patience implements Algorithm {
  public diff < T > ( original: readonly T[], modified: readonly T[], equals: ( o: T, m: T ) => boolean ) : Operation[] {}
}
