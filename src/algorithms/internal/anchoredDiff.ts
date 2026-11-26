import type { Comparable } from '../../types/comparator';
import type { Bounds, Sequence } from '../../types/context';
import type { Operation, Pair } from '../../types/operation';
import { commonEdges } from './commonEdges';
import { createContext } from './createContext';
import { processAnchors } from './processAnchors';


export function anchoredDiff < T extends Comparable > (
  seq: Sequence< T >, strategy: ( seq: Sequence< T >, bounds: Bounds ) => readonly Pair[]
) : Operation[] {
  const { bounds, pushEdit, finish } = createContext( seq );

  const process = ( { oStart, oEnd, mStart, mEnd }: Bounds ) => {
    const { prefix, suffix } = commonEdges( seq, { oStart, oEnd, mStart, mEnd } );
    for ( let i = 0; i < suffix; i++ ) pushEdit( 0 );

    const range = { oStart: oStart + prefix, oEnd: oEnd - suffix, mStart: mStart + prefix, mEnd: mEnd - suffix };
    processAnchors( strategy( seq, range ), seq, range, pushEdit, process );
    for ( let i = 0; i < prefix; i++ ) pushEdit( 0 );
  };

  process( bounds );
  return finish();
}
