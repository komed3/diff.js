import type { Bounds, Context } from '../../types/context';
import type { Pair } from '../../types/operation';
import { myersDiffRange } from './myersDiffRange';


export function processAnchors < T > (
  anchors: readonly Pair[], context: Context< T >, bounds: Bounds, process: ( bounds: Bounds ) => void
) : void {
  if ( ! anchors.length ) return myersDiffRange( context, bounds );
  let oEnd = bounds.oEnd, mEnd = bounds.mEnd;

  for ( let i = anchors.length - 1; i >= 0; i-- ) {
    const { original: o, modified: m } = anchors[ i ];
    if ( o + 1 < oEnd || m + 1 < mEnd ) process( { oStart: o + 1, oEnd, mStart: m + 1, mEnd } );
    context.pushEdit( 0 ), oEnd = o, mEnd = m;
  }

  if ( bounds.oStart < oEnd || bounds.mStart < mEnd ) process( { ...bounds, oEnd, mEnd } );
}
