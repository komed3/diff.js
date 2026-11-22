import type { Bounds, Input } from '../../types/context';
import type { Operation, Pair } from '../../types/operation';
import { commonEdges } from './commonEdges';
import { createContext } from './createContext';
import { processAnchors } from './processAnchors';


export function anchoredDiff < T > (
  input: Input< T >, strategy: ( input: Input< T >, bounds: Bounds ) => readonly Pair[]
) : Operation[] {
  const { bounds, pushEdit, finish } = createContext( input );

  const process = ( { oStart, oEnd, mStart, mEnd }: Bounds ) => {
    const { prefix, suffix } = commonEdges( input, { oStart, oEnd, mStart, mEnd } );
    for ( let i = 0; i < suffix; i++ ) pushEdit( 0 );

    const range = { oStart: oStart + prefix, oEnd: oEnd - suffix, mStart: mStart + prefix, mEnd: mEnd - suffix };
    processAnchors( strategy( input, range ), input, range, pushEdit, process );
    for ( let i = 0; i < prefix; i++ ) pushEdit( 0 );
  };

  process( bounds );
  return finish();
}
