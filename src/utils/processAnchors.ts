import { Myers } from '../algorithms/Myers';
import type { Pair } from '../types/operation';
import { appendOperations } from './appendOperations';
import { longestIncreasingSubsequence } from './longestIncreasingSubsequence';


const myers = new Myers();


export function processAnchors < T > (
  candidates: readonly Pair[], edits: ( 0 | 1 | 2 )[], original: readonly T[], modified: readonly T[],
  equals: ( original: T, modified: T ) => boolean, oStart: number, oEnd: number, mStart: number, mEnd: number,
  process: ( oStart: number, oEnd: number, mStart: number, mEnd: number ) => void
) : void {
  const anchors = longestIncreasingSubsequence( candidates );
  if ( ! anchors.length ) return appendOperations( edits, myers.diff(
    original.slice( oStart, oEnd ), modified.slice( mStart, mEnd ), equals
  ) );

  let [ origIdx, modIdx ] = [ oStart, mStart ];

  for ( const { original, modified } of anchors ) {
    process( origIdx, original, modIdx, modified );
    edits.push( 0 ), origIdx = original + 1, modIdx = modified + 1;
  }

  process( origIdx, oEnd, modIdx, mEnd );
}
