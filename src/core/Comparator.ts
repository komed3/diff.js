import type { Comparator, ComparatorFactory, Comparable } from '../types/comparator';


const ending = ( value: Comparable ) : string | undefined =>
  'offset' in value && 'contentEnd' in value && 'end' in value && 'ending' in value &&
  typeof value.ending === 'string' ? value.ending : undefined;


export const createComparator = < T extends Comparable = Comparable > (
  normalize: ( value: string ) => string, lineEndings = true
) : Comparator< T > => ( {
  equals: ( o, m ) => normalize( o.value ) === normalize( m.value ) && ( ! lineEndings || ending( o ) === ending( m ) ),
  key: v => {
    const value = normalize( v.value );
    return lineEndings ? `${ value.length }:${ value }${ ending( v ) ?? '' }` : value;
  }
} );


export const COMPARATORS = {
  exact: < T extends Comparable = Comparable > ( lineEndings = true ) =>
    createComparator< T >( v => v, lineEndings ),
  whitespace: < T extends Comparable = Comparable > ( lineEndings = true ) =>
    createComparator< T >( v => v.replace( /\s/gu, '' ), lineEndings ),
  collapsedWhitespace: < T extends Comparable = Comparable > ( lineEndings = true ) =>
    createComparator< T >( v => v.trim().replace( /\s+/gu, ' ' ), lineEndings ),
  trimmed: < T extends Comparable = Comparable > ( lineEndings = true ) =>
    createComparator< T >( v => v.trim(), lineEndings ),
  caseInsensitive: < T extends Comparable = Comparable > ( lineEndings = true ) =>
    createComparator< T >( v => v.toLowerCase(), lineEndings ),
  unicode: < T extends Comparable = Comparable > ( lineEndings = true ) =>
    createComparator< T >( v => v.normalize( 'NFC' ), lineEndings )
} satisfies Record< string, ComparatorFactory >;
