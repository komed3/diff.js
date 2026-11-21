import type { Algorithm } from '../types/algorithm';
import type { Operation } from '../types/operation';
import { commonEdges } from '../utils/commonEdges';
import { populateOperations } from '../utils/populateOperations';


export class HuntSzymanski implements Algorithm {
  public diff < T > ( original: readonly T[], modified: readonly T[], equals: ( o: T, m: T ) => boolean ) : Operation[] {
    const { prefix, suffix } = commonEdges( original, modified, equals );

    const n = original.length, m = modified.length, oEnd = n - suffix, mEnd = m - suffix;
    const editCodes = new Int8Array( n + m + 1 ), editCount = n + m + 1;

    let editStart = editCount;

    const pushEdit = ( type: 0 | 1 | 2 ) => editCodes[ --editStart ] = type;
    for ( let i = 0; i < suffix; i++ ) pushEdit( 0 );

    const matchOriginal: number[] = [], matchModified: number[] = [], matchPrevious: number[] = [];
    const tails: number[] = [], tailNodes: number[] = [];

    for ( let i = prefix; i < oEnd; i++ ) {
      const originalValue = original[ i ];

      for ( let j = mEnd - 1; j >= prefix; j-- ) {
        if ( ! equals( originalValue, modified[ j ] ) ) continue;

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

    let i = oEnd, j = mEnd;
    let node = tailNodes[ tails.length - 1 ];

    while ( node !== undefined && node >= 0 ) {
      const origMatch = matchOriginal[ node ], modMatch = matchModified[ node ];

      while ( j > modMatch + 1 ) pushEdit( 1 ), j--;
      while ( i > origMatch + 1 ) pushEdit( 2 ), i--;
      pushEdit( 0 );
      i = origMatch, j = modMatch;
      node = matchPrevious[ node ];
    }

    while ( j > prefix ) pushEdit( 1 ), j--;
    while ( i > prefix ) pushEdit( 2 ), i--;
    for ( let k = 0; k < prefix; k++ ) pushEdit( 0 );

    return populateOperations( editCodes, editStart, editCount );
  }
}
