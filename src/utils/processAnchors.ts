import type { Pair } from '../types/operation';
import { Myers } from '../algorithm/Myers';
import { longestIncreasingSubsequence } from './longestIncreasingSubsequence';


const myers = new Myers();


export function processAnchors < T > (
  candidates: readonly Pair[], pushEdit: ( type: 0 | 1 | 2 ) => void,
  original: readonly T[], modified: readonly T[], equals: ( o: T, m: T ) => boolean,
  oStart: number, oEnd: number, mStart: number, mEnd: number,
  process: ( oStart: number, oEnd: number, mStart: number, mEnd: number ) => void
) : void {
  const anchors = longestIncreasingSubsequence( candidates );
}
