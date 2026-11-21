import type { Algorithm, MyersOptions } from '../types/algorithm';
import type { Operation } from '../types/operation';
import { createOperations } from '../utils/EditScript';
import { findCommonEdges } from '../utils/Sequence';


export class Myers implements Algorithm {
  private readonly mode: 'fast' | 'minimal';

  public constructor ( { mode = 'fast' }: MyersOptions = {} ) {
    this.mode = mode;
  }

  public diff < T > ( original: readonly T[], modified: readonly T[], equals: ( o: T, m: T ) => boolean ) : Operation[] {
    const [ n, m ] = [ original.length, modified.length ];
    const { prefix, suffix } = findCommonEdges( original, modified, equals );
    const editCodes = new Int8Array( n + m + 1 ), editCount = n + m + 1;
    let editStart = editCount;

    const pushEdit = ( type: 0 | 1 | 2 ) => editCodes[ --editStart ] = type;
    for ( let i = 0; i < suffix; i++ ) pushEdit( 0 );

    const [ oLen, mLen ] = [ n - prefix - suffix, m - prefix - suffix ], maxDist = oLen + mLen;
    const limit = this.mode === 'fast' ? Math.min( maxDist, 256 ) : maxDist;

    if ( maxDist ) {
      const frontier = new Int32Array( limit * 2 + 3 ), offset = limit + 1;
      frontier[ offset + 1 ] = 0;

      let trace = new Int32Array( 64 ), dist = 0, finished = false;

      for ( ; dist <= limit; dist++ ) {
        for ( let diag = -dist; diag <= dist; diag += 2 ) {
          const index = offset + diag;

          let x = diag === -dist || ( diag !== dist && frontier[ index - 1 ] < frontier[ index + 1 ] )
            ? frontier[ index + 1 ] : frontier[ index - 1 ] + 1, y = x - diag;

          while ( x < oLen && y < mLen && equals( original[ prefix + x ], modified[ prefix + y ] ) ) x++, y++;
          frontier[ index ] = x;

          if ( x >= oLen && y >= mLen ) { finished = true; break }
        }

        const traceOffset = dist * ( dist + 1 ) / 2, traceLength = traceOffset + dist + 1;

        if ( traceLength > trace.length ) {
          const next = new Int32Array( Math.max( traceLength, trace.length * 2 ) );
          next.set( trace );
          trace = next;
        }

        for ( let diag = -dist, i = 0; diag <= dist; diag += 2, i++ ) trace[ traceOffset + i ] = frontier[ offset + diag ];
        if ( finished ) break;
      }

      if ( finished ) {
        let [ x, y ] = [ oLen, mLen ];

        for ( let d = dist; d > 0; d-- ) {
          const prevOffset = ( d - 1 ) * d / 2, diag = x - y, prevDiag = diag === -d ||
            ( diag !== d && trace[ prevOffset + ( diag + d - 2 ) / 2 ] < trace[ prevOffset + ( diag + d ) / 2 ] )
            ? diag + 1 : diag - 1;

          const prevX = trace[ prevOffset + ( prevDiag + d - 1 ) / 2 ], prevY = prevX - prevDiag;
          while ( x > prevX && y > prevY ) pushEdit( 0 ), x--, y--;

          pushEdit( x === prevX ? 1 : 2 );
          x === prevX ? y-- : x--;
          [ x, y ] = [ prevX, prevY ];
        }

        while ( x > 0 && y > 0 ) pushEdit( 0 ), x--, y--;
        while ( x-- ) pushEdit( 2 );
        while ( y-- ) pushEdit( 1 );
      } else {
        for ( let i = 0; i < mLen; i++ ) pushEdit( 1 );
        for ( let i = 0; i < oLen; i++ ) pushEdit( 2 );
      }
    }

    for ( let i = 0; i < prefix; i++ ) pushEdit( 0 );
    return createOperations( editCodes, editStart, editCount );
  }
}
