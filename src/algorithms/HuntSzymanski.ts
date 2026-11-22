import type { Algorithm } from '../types/algorithm';
import type { Input } from '../types/context';
import type { Operation } from '../types/operation';
import { createContext } from './internal/createContext';
import { addGroup, findGroup } from './internal/group';


export class HuntSzymanski implements Algorithm {
  public diff < T > ( input: Input< T > ) : Operation[] {
    const { original, modified, equals, key } = input;
    const { bounds: { oStart, oEnd, mStart, mEnd }, pushEdit, finish } = createContext( input );
    const matchO: number[] = [], matchM: number[] = [], matchPrev: number[] = [];
    const tails: number[] = [], tailNodes: number[] = [];

    const addMatch = ( i: number, j: number ) => {
      let low = 0, high = tails.length;

      while ( low < high ) {
        const middle = ( low + high ) >>> 1;
        if ( tails[ middle ] < j ) low = middle + 1;
        else high = middle;
      }

      const node = matchO.length;
      matchO.push( i ), matchM.push( j ), matchPrev.push( low ? tailNodes[ low - 1 ] : -1 );
      tails[ low ] = j, tailNodes[ low ] = node;
    };

    if ( key ) {
      const groups: { value: T; modified: number[] }[] = [], oGroups: typeof groups[ number ][] = [];
      const lookup = new Map< unknown, typeof groups[ number ][] >();
      let group: typeof groups[ number ] | undefined;

      for ( let i = oStart; i < oEnd; i++ ) {
        group = findGroup( groups, lookup, original[ i ], equals, key );
        if ( ! group ) addGroup( groups, lookup, group = { value: original[ i ], modified: [] }, key );
        oGroups.push( group );
      }

      for ( let j = mStart; j < mEnd; j++ )
        if ( group = findGroup( groups, lookup, modified[ j ], equals, key ) )
          group.modified.push( j );

      for ( let i = oStart; i < oEnd; i++ ) {
        const matches = oGroups[ i - oStart ].modified;
        for ( let k = matches.length - 1; k >= 0; k-- ) addMatch( i, matches[ k ] );
      }
    }

    else for ( let i = oStart; i < oEnd; i++ ) for ( let j = mEnd - 1; j >= mStart; j-- )
      if ( equals( original[ i ], modified[ j ] ) ) addMatch( i, j );

    let i = oEnd, j = mEnd, node = tailNodes[ tails.length - 1 ];

    while ( node !== undefined && node >= 0 ) {
      const o = matchO[ node ], m = matchM[ node ];

      while ( j > m + 1 ) pushEdit( 1 ), j--;
      while ( i > o + 1 ) pushEdit( 2 ), i--;
      pushEdit( 0 );

      i = o, j = m, node = matchPrev[ node ];
    }

    while ( j > mStart ) pushEdit( 1 ), j--;
    while ( i > oStart ) pushEdit( 2 ), i--;

    return finish();
  }
}
