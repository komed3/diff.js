import type { Algorithm } from '../types/algorithm';
import type { Operation } from '../types/operation';
import { commonEdges } from '../utils/commonEdges';
import { populateOperations } from '../utils/populateOperations';


export class LCS implements Algorithm {
  public diff < T > ( original: readonly T[], modified: readonly T[], equals: ( o: T, m: T ) => boolean ) : Operation[] {
    const { prefix, suffix } = commonEdges( original, modified, equals );

    const n = original.length, m = modified.length;
    const oLen = n - prefix - suffix, mLen = m - prefix - suffix;
    const editCodes = new Int8Array( n + m + 1 ), editCount = n + m + 1;

    let editStart = editCount;

    const pushEdit = ( type: 0 | 1 | 2 ) => editCodes[ --editStart ] = type;
    for ( let i = 0; i < suffix; i++ ) pushEdit( 0 );

    if ( oLen && mLen ) {
      const dirs = new Uint8Array( oLen * mLen );
      let previous = new Uint32Array( mLen + 1 ), current = new Uint32Array( mLen + 1 );
      let temp = previous;

      for ( let i = 1; i <= oLen; i++ ) {
        const originalValue = original[ prefix + i - 1 ], rowOffset = ( i - 1 ) * mLen;

        for ( let j = 1; j <= mLen; j++ ) {
          const index = rowOffset + j - 1;

          if ( equals( originalValue, modified[ prefix + j - 1 ] ) ) current[ j ] = previous[ j - 1 ] + 1, dirs[ index ] = 1;
          else if ( previous[ j ] > current[ j - 1 ] ) current[ j ] = previous[ j ], dirs[ index ] = 2;
          else current[ j ] = current[ j - 1 ], dirs[ index ] = 3;
        }

        temp = previous, previous = current, current = temp;
      }

      let i = oLen, j = mLen;

      while ( i && j ) {
        const direction = dirs[ ( i - 1 ) * mLen + j - 1 ];

        if ( direction === 1 ) pushEdit( 0 ), i--, j--;
        else if ( direction === 2 ) pushEdit( 2 ), i--;
        else pushEdit( 1 ), j--;
      }

      while ( i-- ) pushEdit( 2 );
      while ( j-- ) pushEdit( 1 );
    } else {
      for ( let i = 0; i < oLen; i++ ) pushEdit( 2 );
      for ( let i = 0; i < mLen; i++ ) pushEdit( 1 );
    }

    for ( let i = 0; i < prefix; i++ ) pushEdit( 0 );
    return populateOperations( editCodes, editStart, editCount );
  }
}
