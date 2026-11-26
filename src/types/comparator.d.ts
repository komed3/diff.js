export interface Comparable< T = string > {
  value: T;
}

export interface Comparator< T extends Comparable > {
  equals: ( o: T, m: T ) => boolean;
  key?: ( value: T ) => unknown;
}

export type ComparatorFactory = < T extends Comparable = Comparable > ( lineEndings?: boolean ) =>
  Comparator< T >;
