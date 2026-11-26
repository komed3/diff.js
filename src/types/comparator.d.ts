export interface Comparable< T = string > {
  value: T;
}

export interface Comparator< T extends Comparable > {
  equals: ( o: T, m: T ) => boolean;
  key?: ( value: T ) => unknown;
}

export interface ComparatorOptions {
  lineEndings?: boolean;
}

export type ComparatorFactory = < T extends Comparable = Comparable > (
  options?: ComparatorOptions
) => Comparator< T >;
