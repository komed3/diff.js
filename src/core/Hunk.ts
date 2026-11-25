import type { HunkData, HunkOptions } from '../types/hunk';
import type { Result } from '../types/engine';
import type { LineScript } from '../types/engine';
import type { Range } from '../types/operation';


export class Hunk {
  private readonly context: number;

  public constructor ( { context = 3 }: HunkOptions = {} ) {
    if ( ! Number.isSafeInteger( context ) || context < 0 )
      throw new RangeError( 'Context must be a non-negative integer' );

    this.context = context;
  }
}
