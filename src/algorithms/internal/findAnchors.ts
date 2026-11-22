import type { Bounds, Input } from '../../types/context';
import type { Pair } from '../../types/operation';
import { addGroup, findGroup } from './group';


export function findAnchors < T > ( { original, modified, equals, key }: Input< T >, { oStart, oEnd, mStart, mEnd }: Bounds ) : Pair[] {
  const groups: { value: T; o: number; m: number }[] = [], lookup = new Map< unknown, typeof groups[ number ][] >();
  let group: typeof groups[ number ] | undefined;

  for ( let i = oStart; i < oEnd; i++ ) {
    group = findGroup( groups, lookup, original[ i ], equals, key );
    if ( ! group ) addGroup( groups, lookup, group = { value: original[ i ], o: i, m: -1 }, key );
    else group.o = -1;
  }

  for ( let j = mStart; j < mEnd; j++ ) {
    if ( ! ( group = findGroup( groups, lookup, modified[ j ], equals, key ) ) ) continue;
    group.m = group.m === -1 ? j : -2;
  }

  const anchors: Pair[] = [];
  for ( const { o, m } of groups ) if ( o >= 0 && m >= 0 ) anchors.push( { original: o, modified: m } );

  anchors.sort( ( a, b ) => a.original - b.original );
  return anchors;
}
