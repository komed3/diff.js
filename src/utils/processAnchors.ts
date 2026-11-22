import type { Pair } from '../types/operation';
import { longestIncreasingSubsequence } from './longestIncreasingSubsequence';
import { myersDiffRange } from './myersDiffRange';


export function processAnchors < T > (
  candidates: readonly Pair[], pushEdit: ( type: 0 | 1 | 2 ) => void, original: readonly T[],
  modified: readonly T[], equals: ( o: T, m: T ) => boolean, oStart: number, oEnd: number, mStart: number,
  mEnd: number, process: ( oStart: number, oEnd: number, mStart: number, mEnd: number ) => void
) : void {
  const anchors = longestIncreasingSubsequence( candidates );

  if ( ! anchors.length ) {
    myersDiffRange( original, modified, equals, oStart, oEnd, mStart, mEnd, pushEdit );
    return;
  }

  let origIdx = oEnd, modIdx = mEnd;

  for ( let i = anchors.length - 1; i >= 0; i-- ) {
    const { original: oi, modified: mi } = anchors[ i ];

    process( oi + 1, origIdx, mi + 1, modIdx );
    pushEdit( 0 );

    origIdx = oi, modIdx = mi;
  }

  process( oStart, origIdx, mStart, modIdx );
}
