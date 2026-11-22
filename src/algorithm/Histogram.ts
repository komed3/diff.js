import type { Algorithm } from '../types/algorithm';
import type { Operation } from '../types/operation';
import { commonEdges } from '../utils/commonEdges';
import { createContext } from '../utils/createContext';
import { findAnchors } from '../utils/findAnchors';
import { processAnchors } from '../utils/processAnchors';


export class Histogram implements Algorithm {
  public diff < T > ( original: readonly T[], modified: readonly T[], equals: ( o: T, m: T ) => boolean ) : Operation[] {
    const { oStart, oEnd, mStart, mEnd, pushEdit, finish } = createContext( original, modified, equals );

    const process = ( oStart: number, oEnd: number, mStart: number, mEnd: number ) => {
      const { prefix, suffix } = commonEdges( original, modified, equals, oStart, oEnd, mStart, mEnd );

      for ( let i = 0; i < suffix; i++ ) pushEdit( 0 );
      oStart += prefix, oEnd -= suffix, mStart += prefix, mEnd -= suffix;

      const candidates = findAnchors( original, modified, equals, oStart, oEnd, mStart, mEnd );
      processAnchors( candidates, pushEdit, original, modified, equals, oStart, oEnd, mStart, mEnd, process );

      for ( let i = 0; i < prefix; i++ ) pushEdit( 0 );
    };

    process( oStart, oEnd, mStart, mEnd );
    return finish();
  }
}
