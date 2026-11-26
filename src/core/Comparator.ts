import type { Comparable, Comparator, ComparatorFactory, ComparatorOptions } from '../types/comparator';


const ending = ( value: Comparable ) : string | undefined =>
  'offset' in value && 'contentEnd' in value && 'end' in value && 'ending' in value &&
  typeof value.ending === 'string' ? value.ending : undefined;


export const createComparator = < T extends Comparable = Comparable > (
  normalize: ( value: string ) => string, { lineEndings = true }: ComparatorOptions = {}
) : Comparator< T > => ( {
  equals: ( o, m ) => normalize( o.value ) === normalize( m.value ) && ( ! lineEndings || ending( o ) === ending( m ) ),
  key: v => {
    const value = normalize( v.value );
    return lineEndings ? `${ value.length }:${ value }${ ending( v ) ?? '' }` : value;
  }
} );


export const COMPARATORS = {
  exact: < T extends Comparable = Comparable > ( options: ComparatorOptions = {} ) : Comparator< T > =>
    createComparator< T >( v => v, options ),
  whitespace: < T extends Comparable = Comparable > ( options: ComparatorOptions = {} ) : Comparator< T > =>
    createComparator< T >( v => v.replace( /\s/gu, '' ), options ),
  collapsedWhitespace: < T extends Comparable = Comparable > ( options: ComparatorOptions = {} ) : Comparator< T > =>
    createComparator< T >( v => v.trim().replace( /\s+/gu, ' ' ), options ),
  trimmed: < T extends Comparable = Comparable > ( options: ComparatorOptions = {} ) : Comparator< T > =>
    createComparator< T >( v => v.trim(), options ),
  caseInsensitive: < T extends Comparable = Comparable > ( options: ComparatorOptions = {} ) : Comparator< T > =>
    createComparator< T >( v => v.toLowerCase(), options ),
  unicode: < T extends Comparable = Comparable > ( options: ComparatorOptions = {} ) : Comparator< T > =>
    createComparator< T >( v => v.normalize( 'NFC' ), options )
} satisfies Record< string, ComparatorFactory >;
