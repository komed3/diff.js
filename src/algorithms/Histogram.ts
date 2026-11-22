import type { Algorithm } from '../types/algorithm';
import type { Input } from '../types/context';
import type { Operation, Pair } from '../types/operation';
import { anchoredDiff } from './internal/anchoredDiff';
import { addGroup, findGroup } from './internal/group';


export class Histogram implements Algorithm {
  public diff < T > ( input: Input< T > ) : Operation[] {
    return anchoredDiff( input, ( { original, modified, equals, key }, { oStart, oEnd, mStart, mEnd } ) => {
      const groups: { value: T; o: number[]; m: number[] }[] = [];
      const lookup = new Map< unknown, typeof groups[ number ][] >();
      let group: typeof groups[ number ] | undefined, diag: number;

      for ( let i = oStart; i < oEnd; i++ ) {
        group = findGroup( groups, lookup, original[ i ], equals, key );
        if ( ! group ) addGroup( groups, lookup, group = { value: original[ i ], o: [], m: [] }, key );
        group.o.push( i );
      }

      for ( let j = mStart; j < mEnd; j++ )
        if ( group = findGroup( groups, lookup, modified[ j ], equals, key ) )
          group.m.push( j );

      const frequencies = new Uint32Array( oEnd - oStart );
      for ( const { o } of groups ) for ( const i of o ) frequencies[ i - oStart ] = o.length;

      const maxFrequency = 64;
      let bestO = -1, bestM = -1, bestLength = 0, bestFreq = Infinity;

      for ( const { o, m } of groups ) {
        if ( ! m.length || o.length > maxFrequency ) continue;

        const covered = new Map< number, number >();

        for ( const mi of m ) for ( const oi of o ) {
          if ( ( covered.get( diag = oi - mi ) ?? -1 ) > mi ) continue;

          let startO = oi, startM = mi;
          while ( startO > oStart && startM > mStart &&
            equals( original[ startO - 1 ], modified[ startM - 1 ] ) ) startO--, startM--;

          let endO = oi + 1, endM = mi + 1;
          while ( endO < oEnd && endM < mEnd &&
            equals( original[ endO ], modified[ endM ] ) ) endO++, endM++;

          covered.set( diag, endM );

          const length = endO - startO;
          if ( length < bestLength ) continue;

          let freq = Infinity;
          for ( let i = startO; i < endO; i++ ) freq = Math.min( freq, frequencies[ i - oStart ] );
          if ( length > bestLength || freq < bestFreq ) bestO = startO, bestM = startM, bestLength = length, bestFreq = freq;
        }
      }

      const anchors: Pair[] = [];
      for ( let i = 0; i < bestLength; i++ ) anchors.push( { original: bestO + i, modified: bestM + i } );
      return anchors;
    } );
  }
}
