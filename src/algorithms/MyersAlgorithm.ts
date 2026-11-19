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
    let distance = 0, finished = false;

    frontier.fill( -1 );
    frontier[ offset + 1 ] = 0;

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
  }
}
