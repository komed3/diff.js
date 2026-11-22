import { Myers } from '../algorithm/Myers';
import type { Pair } from '../types/operation';
import { longestIncreasingSubsequence } from './longestIncreasingSubsequence';


const myers = new Myers();


export function processAnchors < T > (
  candidates: readonly Pair[], pushEdit: ( type: 0 | 1 | 2 ) => void, original: readonly T[],
  modified: readonly T[], equals: ( o: T, m: T ) => boolean, oStart: number, oEnd: number, mStart: number,
  mEnd: number, process: ( oStart: number, oEnd: number, mStart: number, mEnd: number ) => void
) : void {
  const anchors = longestIncreasingSubsequence( candidates );
  if ( ! anchors.length ) return myers.diffRange( original, modified, equals, oStart, oEnd, mStart, mEnd, pushEdit );

  let origIdx = oEnd, modIdx = mEnd;

  for ( let i = anchors.length - 1; i >= 0; i-- ) {
    const { original: oi, modified: mi } = anchors[ i ];
    process( oi + 1, origIdx, mi + 1, modIdx ), pushEdit( 0 );
    origIdx = oi, modIdx = mi;
  }

  process( oStart, origIdx, mStart, modIdx );
}
