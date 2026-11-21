import type { Algorithm, HuntSzymanskiOptions } from '../types/algorithm';
import type { Operation } from '../types/operation';


export class HuntSzymanski implements Algorithm {
  private readonly getKey?: ( value: unknown ) => PropertyKey;

  public constructor ( { getKey }: HuntSzymanskiOptions = {} ) {
    this.getKey = getKey;
  }

  public diff < T > ( original: readonly T[], modified: readonly T[], equals: ( original: T, modified: T ) => boolean ) : Operation[] {}
}
