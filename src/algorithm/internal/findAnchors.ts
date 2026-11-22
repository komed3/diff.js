import type { Pair } from '../../types/operation';


export function findAnchors < T > (
  original: readonly T[], modified: readonly T[], equals: ( o: T, m: T ) => boolean,
  oStart: number, oEnd: number, mStart: number, mEnd: number, uniqueOnly = false
) : Pair[] {
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

  let freq = Infinity;

  if ( ! uniqueOnly ) for ( const { original: o, modified: m } of groups )
    if ( o.length && o.length === m.length ) freq = Math.min( freq, o.length + m.length );

  const candidates: Pair[] = [];

  for ( const { original: o, modified: m } of groups ) {
    if ( ! o.length || o.length !== m.length ) continue;
    if ( uniqueOnly ? o.length !== 1 : o.length + m.length !== freq ) continue;

    for ( let i = 0; i < o.length; i++ ) candidates.push( { original: o[ i ], modified: m[ i ] } );
  }

  candidates.sort( ( a, b ) => a.original - b.original );
  return candidates;
}
