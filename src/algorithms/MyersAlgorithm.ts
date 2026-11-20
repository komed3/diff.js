import type { DiffAlgorithm } from '../types/algorithm';
import type { DiffOperation, DiffOperationType } from '../types/operation';
import type { DiffToken } from '../types/token';


export class MyersAlgorithm implements DiffAlgorithm {
  public diff < T extends Record< string, unknown > = {} > (
    original: readonly DiffToken< T >[],
    modified: readonly DiffToken< T >[]
  ) : DiffOperation[] {
    const originalLength = original.length, modifiedLength = modified.length;
    const maxDistance = originalLength + modifiedLength, offset = maxDistance + 1;
    const frontier = new Int32Array( maxDistance * 2 + 3 );
    const trace: Int32Array[] = [], edits: DiffOperationType[] = [];

    frontier.fill( -1 );
    frontier[ offset + 1 ] = 0;

    let distance = 0, finished = false;

    for ( ; distance <= maxDistance; distance++ ) {
      for ( let diagonal = -distance; diagonal <= distance; diagonal += 2 ) {
        const index = offset + diagonal;
        let x = diagonal === -distance ||
          ( diagonal !== distance && frontier[ index - 1 ] < frontier[ index + 1 ] )
          ? frontier[ index + 1 ] : frontier[ index - 1 ] + 1;

        let y = x - diagonal;

        while (
          x < originalLength && y < modifiedLength &&
          original[ x ].value === modified[ y ].value
        ) x++, y++;

        frontier[ index ] = x;

        if ( x >= originalLength && y >= modifiedLength ) {
          finished = true;
          break;
        }
      }

      const layer = new Int32Array( distance * 2 + 3 );

      for ( let diagonal = -distance - 1; diagonal <= distance + 1; diagonal++ )
        layer[ diagonal + distance + 1 ] = frontier[ offset + diagonal ];

      trace.push( layer );
      if ( finished ) break;
    }

    let x = originalLength, y = modifiedLength;

    for ( let d = distance; d > 0; d-- ) {
      const previous = trace[ d - 1 ], diagonal = x - y;
      const previousDiagonal = diagonal === -d ||
        ( diagonal !== d && previous[ diagonal + d - 1 ] < previous[ diagonal + d + 1 ] )
        ? diagonal + 1 : diagonal - 1;

      const previousX = previous[ previousDiagonal + d ];
      const previousY = previousX - previousDiagonal;

      while ( x > previousX && y > previousY ) edits.push( 'equal' ), x--, y--;

      if ( x === previousX ) edits.push( 'insert' ), y--;
      else edits.push( 'delete' ), x--;

      x = previousX, y = previousY;
    }

    while ( x > 0 && y > 0 ) edits.push( 'equal' ), x--, y--;
    while ( x > 0 ) edits.push( 'delete' ), x--;
    while ( y > 0 ) edits.push( 'insert' ), y--;

    edits.reverse();

    const operations: DiffOperation[] = [];
    let originalIndex = 0, modifiedIndex = 0;

    for ( let i = 0; i < edits.length; ) {
      const type = edits[ i ], start = i;

      while ( i < edits.length && edits[ i ] === type ) i++;

      const length = i - start;

      if ( type === 'equal' ) operations.push( {
        type,
        original: { start: originalIndex, length },
        modified: { start: modifiedIndex, length }
      } );
      else if ( type === 'insert' ) operations.push( {
        type,
        original: { start: originalIndex, length: 0 },
        modified: { start: modifiedIndex, length }
      } );
      else operations.push( {
        type,
        original: { start: originalIndex, length },
        modified: { start: modifiedIndex, length: 0 }
      } );

      if ( type !== 'insert' ) originalIndex += length;
      if ( type !== 'delete' ) modifiedIndex += length;
    }

    return operations;
  }
}
