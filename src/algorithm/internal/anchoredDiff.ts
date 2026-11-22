import type { Bounds, Input } from '../../types/context';
import type { Operation, Pair } from '../../types/operation';
import { commonEdges } from './commonEdges';
import { createContext } from './createContext';
import { processAnchors } from './processAnchors';


export function anchoredDiff < T > (
  input: Input< T >, strategy: ( input: Input< T >, bounds: Bounds ) => readonly Pair[]
) : Operation[] {
  const context = createContext( input );

  const process = ( bounds: Bounds ) => {
    const { prefix, suffix } = commonEdges( context.input, bounds );
    for ( let i = 0; i < suffix; i++ ) context.pushEdit( 0 );

    const range: Bounds = {
      oStart: bounds.oStart + prefix, oEnd: bounds.oEnd - suffix,
      mStart: bounds.mStart + prefix, mEnd: bounds.mEnd - suffix
    };

    processAnchors( strategy( context.input, range ), context, range, process );
    for ( let i = 0; i < prefix; i++ ) context.pushEdit( 0 );
  };

  process( context.bounds );
  return context.finish();
}
