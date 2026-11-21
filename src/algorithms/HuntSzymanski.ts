import type { Algorithm, HuntSzymanskiOptions } from '../types/algorithm';
import type { Operation } from '../types/operation';
import { createOperations } from '../utils/EditScript';


export class HuntSzymanski implements Algorithm {
  private readonly getKey?: ( value: unknown ) => PropertyKey;

  public constructor ( { getKey }: HuntSzymanskiOptions = {} ) {
    this.getKey = getKey;
  }

  public diff < T > ( original: readonly T[], modified: readonly T[], equals: ( original: T, modified: T ) => boolean ) : Operation[] {
    const positions = new Map< PropertyKey, number[] >();

    if ( this.getKey ) for ( let j = 0; j < modified.length; j++ ) {
      const key = this.getKey( modified[ j ] ), matches = positions.get( key );

      if ( matches ) matches.push( j );
      else positions.set( key, [ j ] );
    }

    const matchOriginal: number[] = [], matchModified: number[] = [], matchPrevious: number[] = [];
    const tails: number[] = [], tailNodes: number[] = [];

    for ( let i = 0; i < original.length; i++ ) {
      const candidates = this.getKey ? positions.get( this.getKey( original[ i ] ) ) : undefined;

      for ( let k = ( candidates?.length ?? modified.length ) - 1; k >= 0; k-- ) {
        const j = candidates ? candidates[ k ] : k;
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

    const matches: number[] = [];
    let node = tailNodes[ tails.length - 1 ];

    while ( node !== undefined && node >= 0 ) matches.push( node ), node = matchPrevious[ node ];

    matches.reverse();

    const edits: ( 0 | 1 | 2 )[] = [];
    let [ origIdx, modIdx ] = [ 0, 0 ];

    for ( const match of matches ) {
      const i = matchOriginal[ match ], j = matchModified[ match ];

      while ( origIdx < i ) edits.push( 2 ), origIdx++;
      while ( modIdx < j ) edits.push( 1 ), modIdx++;

      edits.push( 0 );
      origIdx++, modIdx++;
    }

    while ( origIdx < original.length ) edits.push( 2 ), origIdx++;
    while ( modIdx < modified.length ) edits.push( 1 ), modIdx++;

    return createOperations( edits );
  }
}
