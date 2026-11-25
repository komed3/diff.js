import type { Result } from '../types/engine';
import type { HunkData, HunkOptions } from '../types/hunk';
import type { Range } from '../types/operation';


export class Hunk {
  private readonly context: number;

  public constructor ( { context = 3 }: HunkOptions = {} ) {
    if ( ! Number.isSafeInteger( context ) || context < 0 )
      throw new RangeError( 'Context must be a non-negative integer' );

    this.context = context;
  }

  public create ( { script }: Result ) : HunkData[] {
    const hunks: HunkData[] = [];
    let start = -1, last = -1;

    const finish = () => {
      if ( start < 0 ) return;

      const lines = script.slice(
        Math.max( 0, start - this.context ),
        Math.min( script.length, last + this.context + 1 )
      );
      const original: Range = {
        start: lines[ 0 ].operation.original.start,
        length: lines.reduce( ( sum, line ) => sum + line.operation.original.length, 0 )
      };
      const modified: Range = {
        start: lines[ 0 ].operation.modified.start,
        length: lines.reduce( ( sum, line ) => sum + line.operation.modified.length, 0 )
      };

      hunks.push( { original, modified, lines } );
      start = last = -1;
    };

    for ( let i = 0; i < script.length; i++ ) {
      if ( script[ i ].operation.type === 'equal' ) continue;

      if ( start < 0 ) start = i;
      else if ( i - last - 1 > this.context * 2 ) {
        finish();
        start = i;
      }

      last = i;
    }

    finish();
    return hunks;
  }
}
