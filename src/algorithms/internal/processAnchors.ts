import type { Comparable } from '../../types/comparator';
import type { Bounds, Sequence } from '../../types/context';
import type { Pair } from '../../types/operation';
import { myersDiffRange } from './myersDiffRange';


export function processAnchors < T extends Comparable > (
  anchors: readonly Pair[], seq: Sequence< T >, bounds: Bounds,
  pushEdit: ( type: 0 | 1 | 2 ) => void, process: ( bounds: Bounds ) => void
) : void {
  if ( ! anchors.length ) return myersDiffRange( seq, bounds, pushEdit );
  let oEnd = bounds.oEnd, mEnd = bounds.mEnd;

  for ( let i = anchors.length - 1; i >= 0; i-- ) {
    const { original: o, modified: m } = anchors[ i ];
    if ( o + 1 < oEnd || m + 1 < mEnd ) process( { oStart: o + 1, oEnd, mStart: m + 1, mEnd } );
    pushEdit( 0 ), oEnd = o, mEnd = m;
  }

  if ( bounds.oStart < oEnd || bounds.mStart < mEnd ) process( { ...bounds, oEnd, mEnd } );
}
