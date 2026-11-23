import type { Comparator, Comparable } from '../types/context';


export const createComparator = ( normalize: ( value: string ) => string ) : Comparator< Comparable > => ( {
  equals: ( o, m ) => normalize( o.value ) === normalize( m.value ), key: v => normalize( v.value )
} );
