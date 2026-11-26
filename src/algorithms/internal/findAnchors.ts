import type { Comparable } from '../../types/comparator';
import type { Bounds, Sequence } from '../../types/context';
import type { AnchorGroup } from '../../types/group';
import type { Pair } from '../../types/operation';
import { addGroup, findGroup } from './group';


export function findAnchors < T extends Comparable > (
  { original, modified, equals, key }: Sequence< T >, { oStart, oEnd, mStart, mEnd }: Bounds
) : Pair[] {
  const groups: AnchorGroup< T >[] = [], lookup = new Map< unknown, AnchorGroup< T >[] >();
  let group: AnchorGroup< T > | undefined;

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
  return anchors;
}
