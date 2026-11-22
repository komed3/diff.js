import type { Algorithm } from '../types/algorithm';
import type { Operation, Pair } from '../types/operation';
import { populateOperations } from '../utils/populateOperations';
import { processAnchors } from '../utils/processAnchors';


export class Patience implements Algorithm {
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

      const groups: { value: T; original: number; modified: number; oCount: number; mCount: number }[] = [];

      for ( let i = oStart; i < oEnd; i++ ) {
        let group = groups.find( group => equals( group.value, original[ i ] ) );
        if ( ! group ) groups.push( group = { value: original[ i ], original: i, modified: -1, oCount: 0, mCount: 0 } );
        group.oCount++;
      }

      for ( let j = mStart; j < mEnd; j++ ) {
        const group = groups.find( ( { value } ) => equals( value, modified[ j ] ) );
        if ( group ) group.mCount++, group.modified = j;
      }

      const candidates: Pair[] = [];

      for ( const { oCount, mCount, original, modified } of groups )
        if ( oCount === 1 && mCount === 1 ) candidates.push( { original, modified } );

      processAnchors( candidates, pushEdit, original, modified, equals, oStart, oEnd, mStart, mEnd, process );
      for ( let i = 0; i < prefix; i++ ) pushEdit( 0 );
    };

    process( 0, n, 0, m );
    return populateOperations( editCodes, editStart, editCount );
  }
}
