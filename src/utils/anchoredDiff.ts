import type { Operation } from '../types/operation';
import { commonEdges } from './commonEdges';
import { createContext } from './createContext';
import { findAnchors } from './findAnchors';
import { processAnchors } from './processAnchors';


export function anchoredDiff < T > (
  original: readonly T[], modified: readonly T[], equals: ( o: T, m: T ) => boolean,
  uniqueOnly = false
) : Operation[] {
  const { oStart, oEnd, mStart, mEnd, pushEdit, finish } = createContext( original, modified, equals );

  const process = ( oStart: number, oEnd: number, mStart: number, mEnd: number ) => {
    const { prefix, suffix } = commonEdges( original, modified, equals, oStart, oEnd, mStart, mEnd );

    for ( let i = 0; i < suffix; i++ ) pushEdit( 0 );
    oStart += prefix, oEnd -= suffix, mStart += prefix, mEnd -= suffix;

    processAnchors(
      findAnchors( original, modified, equals, oStart, oEnd, mStart, mEnd, uniqueOnly ),
      pushEdit, original, modified, equals, oStart, oEnd, mStart, mEnd, process
    );

    for ( let i = 0; i < prefix; i++ ) pushEdit( 0 );
  };

  process( oStart, oEnd, mStart, mEnd );
  return finish();
}
