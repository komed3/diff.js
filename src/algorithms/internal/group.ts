import type { Group } from '../../types/group';


export function findGroup < T, G extends Group< T > > (
  groups: readonly G[], lookup: Map< unknown, G[] >, value: T,
  equals: ( o: T, m: T ) => boolean, key?: ( value: T ) => unknown
) : G | undefined {
  const candidates = key ? lookup.get( key( value ) ) : groups;
  return candidates?.find( g => equals( g.value, value ) );
}


export function addGroup < T, G extends Group< T > > (
  groups: G[], lookup: Map< unknown, G[] >, group: G, key?: ( value: T ) => unknown
) : void {
  groups.push( group );
  if ( ! key ) return;

  const value = key( group.value ), bucket = lookup.get( value );
  if ( bucket ) bucket.push( group );
  else lookup.set( value, [ group ] );
}
