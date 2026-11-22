import type { Algorithm } from '../types/algorithm';
import type { Operation } from '../types/operation';
import { createContext } from '../utils/createContext';


export class LCS implements Algorithm {
  public diff < T > ( original: readonly T[], modified: readonly T[], equals: ( o: T, m: T ) => boolean ) : Operation[] {
    const { prefix, oLen, mLen, pushEdit, finish } = createContext( original, modified, equals );

    if ( oLen && mLen ) {
      const dirs = new Uint8Array( oLen * mLen );
      let prev = new Uint32Array( mLen + 1 ), curr = new Uint32Array( mLen + 1 ), temp = prev;

      for ( let i = 1; i <= oLen; i++ ) {
        const value = original[ prefix + i - 1 ], rowOffset = ( i - 1 ) * mLen;

        for ( let j = 1; j <= mLen; j++ ) {
          const index = rowOffset + j - 1;

          if ( equals( value, modified[ prefix + j - 1 ] ) ) curr[ j ] = prev[ j - 1 ] + 1, dirs[ index ] = 1;
          else if ( prev[ j ] > curr[ j - 1 ] ) curr[ j ] = prev[ j ], dirs[ index ] = 2;
          else curr[ j ] = curr[ j - 1 ], dirs[ index ] = 3;
        }

        temp = prev, prev = curr, curr = temp;
      }

      let i = oLen, j = mLen;

      while ( i && j ) {
        const dir = dirs[ ( i - 1 ) * mLen + j - 1 ];

        if ( dir === 1 ) pushEdit( 0 ), i--, j--;
        else if ( dir === 2 ) pushEdit( 2 ), i--;
        else pushEdit( 1 ), j--;
      }

      while ( i-- ) pushEdit( 2 );
      while ( j-- ) pushEdit( 1 );
    } else {
      for ( let i = 0; i < oLen; i++ ) pushEdit( 2 );
      for ( let i = 0; i < mLen; i++ ) pushEdit( 1 );
    }

    return finish();
  }
}
