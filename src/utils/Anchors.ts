import type { Pair } from '../types/operation';


export function processAnchors (
  anchors: readonly Pair[], edits: ( 0 | 1 | 2 )[], oStart: number, oEnd: number, mStart: number, mEnd: number,
  process: ( oStart: number, oEnd: number, mStart: number, mEnd: number ) => void, fallback: () => void
) : void {
  if ( ! anchors.length ) return fallback();
  let [ origIdx, modIdx ] = [ oStart, mStart ];

  for ( const { original, modified } of anchors ) {
    process( origIdx, original, modIdx, modified );
    edits.push( 0 ), origIdx = original + 1, modIdx = modified + 1;
  }

  process( origIdx, oEnd, modIdx, mEnd );
}
