import type { Pair } from '../types/operation';
import { Myers } from '../algorithm/Myers';
import { longestIncreasingSubsequence } from './longestIncreasingSubsequence';


const myers = new Myers();


export function processAnchors < T > (
  candidates: readonly Pair[], pushEdit: ( type: 0 | 1 | 2 ) => void, original: readonly T[],
  modified: readonly T[], equals: ( o: T, m: T ) => boolean, oStart: number, oEnd: number, mStart: number,
  mEnd: number, process: ( oStart: number, oEnd: number, mStart: number, mEnd: number ) => void
) : void {
  const anchors = longestIncreasingSubsequence( candidates );

  if ( ! anchors.length ) {
    const operations = myers.diff( original.slice( oStart, oEnd ), modified.slice( mStart, mEnd ), equals );

    for ( let i = operations.length - 1; i >= 0; i-- ) {
      const { type, original: o, modified: m } = operations[ i ];
      const code = type === 'equal' ? 0 : type === 'insert' ? 1 : 2;
      const length = type === 'insert' ? m.length : o.length;

      for ( let j = 0; j < length; j++ ) pushEdit( code );
    }

    return;
  }

  let origIdx = oEnd, modIdx = mEnd;

  for ( let i = anchors.length - 1; i >= 0; i-- ) {
    const { original: oi, modified: mi } = anchors[ i ];
    process( oi + 1, origIdx, mi + 1, modIdx ), pushEdit( 0 );
    origIdx = oi, modIdx = mi;
  }

  process( oStart, origIdx, mStart, modIdx );
}
