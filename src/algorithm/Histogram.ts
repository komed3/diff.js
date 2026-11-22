import type { Algorithm } from '../types/algorithm';
import type { Operation, Pair } from '../types/operation';
import { populateOperations } from '../utils/populateOperations';
import { processAnchors } from '../utils/processAnchors';


export class Histogram implements Algorithm {
  public diff < T > ( original: readonly T[], modified: readonly T[], equals: ( o: T, m: T ) => boolean ) : Operation[] {
    const n = original.length, m = modified.length;
    const editCodes = new Int8Array( n + m + 1 ), editCount = n + m + 1;

    let editStart = editCount;

    const pushEdit = ( type: 0 | 1 | 2 ) => editCodes[ --editStart ] = type;

    const process = ( oStart: number, oEnd: number, mStart: number, mEnd: number ) => {
      let prefix = 0, suffix = 0;

      while ( oStart + prefix < oEnd && mStart + prefix < mEnd &&
        equals( original[ oStart + prefix ], modified[ mStart + prefix ] ) ) prefix++;

      while ( oEnd - suffix > oStart + prefix && mEnd - suffix > mStart + prefix &&
        equals( original[ oEnd - suffix - 1 ], modified[ mEnd - suffix - 1 ] ) ) suffix++;

      for ( let i = 0; i < suffix; i++ ) pushEdit( 0 );
      oStart += prefix, mStart += prefix, oEnd -= suffix, mEnd -= suffix;

      const groups: { value: T; original: number[]; modified: number[] }[] = [];

      for ( let i = oStart; i < oEnd; i++ ) {
        let group = groups.find( ( { value } ) => equals( value, original[ i ] ) );
        if ( ! group ) groups.push( group = { value: original[ i ], original: [], modified: [] } );
        group.original.push( i );
      }

      for ( let j = mStart; j < mEnd; j++ ) {
        const group = groups.find( ( { value } ) => equals( value, modified[ j ] ) );
        if ( group ) group.modified.push( j );
      }

      const candidates: Pair[] = [];
      let freq = Infinity;

      for ( const { original: o, modified: m } of groups ) {
        if ( ! m.length || o.length !== m.length ) continue;

        const curr = o.length + m.length;
        if ( curr < freq ) freq = curr, candidates.length = 0;
        if ( curr !== freq ) continue;

        for ( let i = 0; i < o.length; i++ ) candidates.push( { original: o[ i ], modified: m[ i ] } );
      }

      candidates.sort( ( a, b ) => a.original - b.original );
      processAnchors( candidates, pushEdit, original, modified, equals, oStart, oEnd, mStart, mEnd, process );
      for ( let i = 0; i < prefix; i++ ) pushEdit( 0 );
    };

    process( 0, n, 0, m );
    return populateOperations( editCodes, editStart, editCount );
  }
}
