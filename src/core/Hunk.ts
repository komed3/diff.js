import type { Result } from '../types/engine';
import type { HunkData, HunkOptions } from '../types/hunk';


export class Hunk {
  private readonly context: number;

  public constructor ( { context = 3 }: HunkOptions = {} ) {
    if ( ! Number.isSafeInteger( context ) || context < 0 )
      throw new RangeError( 'Context must be a non-negative integer' );

    this.context = context;
  }

  public create ( { script }: Result ) : HunkData[] {
    const ctx = this.context, hunks: HunkData[] = [];
    let start = -1, last = -1;

    const finish = () => {
      if ( start < 0 ) return;

      const lines = script.slice( Math.max( 0, start - ctx ), Math.min( script.length, last + ctx + 1 ) );
      const original = { start: lines[ 0 ].operation.original.start, length: 0 };
      const modified = { start: lines[ 0 ].operation.modified.start, length: 0 };

      for ( const { operation } of lines )
        original.length += operation.original.length,
        modified.length += operation.modified.length;

      hunks.push( { original, modified, lines, header: {
        original: { ...original, start: original.start + Number( original.length > 0 ) },
        modified: { ...modified, start: modified.start + Number( modified.length > 0 ) }
      } } );

      start = last = -1;
    };

    for ( let i = 0; i < script.length; i++ ) {
      if ( script[ i ].operation.type === 'equal' ) continue;

      if ( start < 0 ) start = i;
      else if ( i - last - 1 > ctx * 2 ) finish(), start = i;

      last = i;
    }

    finish();
    return hunks;
  }
}
