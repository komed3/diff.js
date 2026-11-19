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
  }
}
