import type { Algorithm } from '../types/algorithm';
import type { Operation } from '../types/operation';
import { createContext } from '../utils/createContext';


export class HuntSzymanski implements Algorithm {
  public diff < T > ( original: readonly T[], modified: readonly T[], equals: ( o: T, m: T ) => boolean ) : Operation[] {
    const ctx = createContext( original, modified, equals );
    const { oStart, oEnd, mStart, mEnd, pushEdit } = ctx;
    const matchOrig: number[] = [], matchMod: number[] = [], matchPrev: number[] = [];
    const tails: number[] = [], tailNodes: number[] = [];

    for ( let i = oStart; i < oEnd; i++ ) {
      const value = original[ i ];

      for ( let j = mEnd - 1; j >= mStart; j-- ) {
        if ( ! equals( value, modified[ j ] ) ) continue;

        let low = 0, high = tails.length;

        while ( low < high ) {
          const middle = ( low + high ) >>> 1;
          if ( tails[ middle ] < j ) low = middle + 1;
          else high = middle;
        }

        const node = matchOrig.length;

        matchOrig.push( i ), matchMod.push( j );
        matchPrev.push( low ? tailNodes[ low - 1 ] : -1 );
        tails[ low ] = j, tailNodes[ low ] = node;
      }
    }

    let i = oEnd, j = mEnd, node = tailNodes[ tails.length - 1 ];

    while ( node !== undefined && node >= 0 ) {
      const o = matchOrig[ node ], m = matchMod[ node ];

      while ( j > m + 1 ) pushEdit( 1 ), j--;
      while ( i > o + 1 ) pushEdit( 2 ), i--;
      pushEdit( 0 );

      i = o, j = m, node = matchPrev[ node ];
    }

    while ( j > mStart ) pushEdit( 1 ), j--;
    while ( i > oStart ) pushEdit( 2 ), i--;

    return ctx.finish();
  }
}
