import type { Pair } from '../types/operation';


export function processAnchors (
  anchors: readonly Pair[], oStart: number, oEnd: number, mStart: number, mEnd: number,
  process: ( oStart: number, oEnd: number, mStart: number, mEnd: number ) => void,
  fallback: () => void
): void {
  if ( ! anchors.length ) return fallback();
  let [ origIdx, modIdx ] = [ oStart, mStart ];

  for ( const anchor of anchors ) {
    process( origIdx, anchor.original, modIdx, anchor.modified );
    origIdx = anchor.original + 1, modIdx = anchor.modified + 1;
  }

  process( origIdx, oEnd, modIdx, mEnd );
}
