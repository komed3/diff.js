import type { Comparator, Comparable } from '../types/context';


export const createComparator = ( normalize: ( value: string ) => string ) : Comparator< Comparable > => ( {
  equals: ( o, m ) => normalize( o.value ) === normalize( m.value ), key: v => normalize( v.value )
} );


export const COMPARATORS = {
  exact: { equals: ( o, m ) => o.value === m.value, key: v => v.value },
  whitespace: createComparator( v => v.replace( /\s/gu, '' ) ),
  collapsedWhitespace: createComparator( v => v.trim().replace( /\s+/gu, ' ' ) ),
  trimmed: createComparator( v => v.trim() ),
  caseInsensitive: createComparator( v => v.toLowerCase() ),
  unicode: createComparator( v => v.normalize( 'NFC' ) )
} as const satisfies Record< string, Comparator< Comparable > >;
