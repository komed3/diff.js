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

    const matchOriginal: number[] = [], matchModified: number[] = [], matchPrevious: number[] = [];
    const tails: number[] = [], tailNodes: number[] = [];

    for ( let i = 0; i < original.length; i++ ) {
      const candidates = this.getKey ? positions.get( this.getKey( original[ i ] ) ) ?? [] :
        Array.from( { length: modified.length }, ( _, j ) => j );

      for ( let k = candidates.length - 1; k >= 0; k-- ) {
        const j = candidates[ k ];
        if ( ! equals( original[ i ], modified[ j ] ) ) continue;

        let low = 0, high = tails.length;

        while ( low < high ) {
          const middle = ( low + high ) >>> 1;

          if ( tails[ middle ] < j ) low = middle + 1;
          else high = middle;
        }

        const node = matchOriginal.length;

        matchOriginal.push( i ), matchModified.push( j );
        matchPrevious.push( low ? tailNodes[ low - 1 ] : -1 );
        tails[ low ] = j, tailNodes[ low ] = node;
      }
    }
  }
}
