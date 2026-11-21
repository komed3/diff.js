import type { Algorithm, HuntSzymanskiOptions } from '../types/algorithm';
import type { Operation } from '../types/operation';


export class HuntSzymanski implements Algorithm {
  private readonly getKey?: ( value: unknown ) => PropertyKey;

  public constructor ( { getKey }: HuntSzymanskiOptions = {} ) {
    this.getKey = getKey;
  }

  public diff < T > ( original: readonly T[], modified: readonly T[], equals: ( original: T, modified: T ) => boolean ) : Operation[] {
    const positions = new Map < PropertyKey, number[] > ();

    if ( this.getKey ) {
      for ( let j = 0; j < modified.length; j++ ) {
        const key = this.getKey( modified[ j ] ), matches = positions.get( key );

        if ( matches ) matches.push( j );
        else positions.set( key, [ j ] );
      }
    }
  }
}
