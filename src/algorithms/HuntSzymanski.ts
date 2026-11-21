import type { Algorithm, HuntSzymanskiOptions } from '../types/algorithm';
import type { Operation } from '../types/operation';
import { createOperations } from '../utils/createOperations';
import { findCommonEdges } from '../utils/findCommonEdges';


export class HuntSzymanski implements Algorithm {
  private readonly getKey?: ( value: unknown ) => PropertyKey;

  public constructor ( { getKey }: HuntSzymanskiOptions = {} ) {
    this.getKey = getKey;
  }

  public diff < T > ( original: readonly T[], modified: readonly T[], equals: ( o: T, m: T ) => boolean ) : Operation[] {
    const { prefix, suffix } = findCommonEdges( original, modified, equals );
    const [ oEnd, mEnd ] = [ original.length - suffix, modified.length - suffix ];
    const positions = this.getKey ? new Map< PropertyKey, number[] >() : undefined;

    if ( positions ) for ( let j = prefix; j < mEnd; j++ ) {
      const key = this.getKey!( modified[ j ] ), matches = positions.get( key );

      if ( matches ) matches.push( j );
      else positions.set( key, [ j ] );
    }

    const matchOriginal: number[] = [], matchModified: number[] = [], matchPrevious: number[] = [];
    const tails: number[] = [], tailNodes: number[] = [];

    for ( let i = prefix; i < oEnd; i++ ) {
      const candidates = positions?.get( this.getKey!( original[ i ] ) );

      for ( let k = ( candidates?.length ?? mEnd - prefix ) - 1; k >= 0; k-- ) {
        const j = candidates ? candidates[ k ] : prefix + k;
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
    for ( let i = 0; i < prefix; i++ ) edits.push( 0 );

    let [ origIdx, modIdx ] = [ prefix, prefix ];

    for ( const match of matches ) {
      const i = matchOriginal[ match ], j = matchModified[ match ];

      while ( origIdx < i ) edits.push( 2 ), origIdx++;
      while ( modIdx < j ) edits.push( 1 ), modIdx++;

      edits.push( 0 );
      origIdx++, modIdx++;
    }

    while ( origIdx < oEnd ) edits.push( 2 ), origIdx++;
    while ( modIdx < mEnd ) edits.push( 1 ), modIdx++;
    for ( let i = 0; i < suffix; i++ ) edits.push( 0 );

    return createOperations( edits );
  }
}
