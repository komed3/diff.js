import type { Bounds, Input } from '../../types/context';
import type { Pair } from '../../types/operation';


export function findAnchors < T > ( { original, modified, equals }: Input< T >, { oStart, oEnd, mStart, mEnd }: Bounds ) : Pair[] {
  const groups: { value: T; o: number; m: number }[] = [];

  for ( let i = oStart; i < oEnd; i++ ) {
    let group = groups.find( ( { value } ) => equals( value, original[ i ] ) );
    if ( ! group ) groups.push( group = { value: original[ i ], o: i, m: -1 } );
    else group.o = -1;
  }

  for ( let j = mStart; j < mEnd; j++ ) {
    const group = groups.find( ( { value } ) => equals( value, modified[ j ] ) );
    if ( ! group ) continue;

    group.m = group.m === -1 ? j : -2;
  }

  const anchors: Pair[] = [];
  for ( const { o, m } of groups ) if ( o >= 0 && m >= 0 ) anchors.push( { original: o, modified: m } );

  anchors.sort( ( a, b ) => a.original - b.original );
  return anchors;
}
