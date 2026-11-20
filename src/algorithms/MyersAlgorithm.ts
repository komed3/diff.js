import type { Algorithm } from '../types/algorithm';
import type { Operation, OperationType } from '../types/operation';
import type { Token } from '../types/token';


export class MyersAlgorithm implements Algorithm {
  public diff < T extends Record< string, unknown > = {} > (
    original: readonly Token< T >[], modified: readonly Token< T >[]
  ) : Operation[] {
    const [ oLen, mLen ] = [ original.length, modified.length ];
    const maxDist = oLen + mLen, offset = maxDist + 1;
    const edits: OperationType[] = [], trace: Int32Array[] = [];

    const frontier = new Int32Array( maxDist * 2 + 3 ).fill( -1 );
    frontier[ offset + 1 ] = 0;

    let distance = 0, finished = false;

    for ( ; distance <= maxDist; distance++ ) {
      for ( let diag = -distance; diag <= distance; diag += 2 ) {
        const index = offset + diag;
        let x = diag === -distance || ( diag !== distance && frontier[ index - 1 ] < frontier[ index + 1 ] )
          ? frontier[ index + 1 ] : frontier[ index - 1 ] + 1, y = x - diag;

        while ( x < oLen && y < mLen && original[ x ].value === modified[ y ].value ) x++, y++;
        frontier[ index ] = x;

        if ( x >= oLen && y >= mLen ) { finished = true; break }
      }

      const layer = new Int32Array( distance * 2 + 3 );

      for ( let diag = -distance - 1; diag <= distance + 1; diag++ )
        layer[ diag + distance + 1 ] = frontier[ offset + diag ];

      trace.push( layer );
      if ( finished ) break;
    }

    let [ x, y ] = [ oLen, mLen ];

    for ( let d = distance; d > 0; d-- ) {
      const prev = trace[ d - 1 ], diag = x - y, prevDiag = diag === -d ||
        ( diag !== d && prev[ diag + d - 1 ] < prev[ diag + d + 1 ] ) ? diag + 1 : diag - 1;

      const prevX = prev[ prevDiag + d ], prevY = prevX - prevDiag;
      while ( x > prevX && y > prevY ) edits.push( 'equal' ), x--, y--;

      edits.push( x === prevX ? 'insert' : 'delete' ), x === prevX ? y-- : x--;
      [ x, y ] = [ prevX, prevY ];
    }

    while ( x > 0 && y > 0 ) edits.push( 'equal' ), x--, y--;
    while ( x-- ) edits.push( 'delete' );
    while ( y-- ) edits.push( 'insert' );

    edits.reverse();

    const operations: Operation[] = [];
    let [ origIdx, modIdx ] = [ 0, 0 ];

    for ( let i = 0; i < edits.length; ) {
      const type = edits[ i ], start = i;
      while ( i < edits.length && edits[ i ] === type ) i++;
      const length = i - start;

      operations.push( {
        type,
        original: { start: origIdx, length: type === 'insert' ? 0 : length },
        modified: { start: modIdx, length: type === 'delete' ? 0 : length }
      } as Operation );

      if ( type !== 'insert' ) origIdx += length;
      if ( type !== 'delete' ) modIdx += length;
    }

    return operations;
  }
}
