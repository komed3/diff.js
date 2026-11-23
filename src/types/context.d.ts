import type { Operation } from './operation';


export interface Comparable< T = string > {
  value: T;
}

export interface Comparator< T extends Comparable > {
  equals: ( o: T, m: T ) => boolean;
  key?: ( value: T ) => unknown;
}

export interface Sequence< T extends Comparable > extends Comparator< T > {
  original: readonly T[];
  modified: readonly T[];
}

export interface Bounds {
  oStart: number;
  oEnd: number;
  mStart: number;
  mEnd: number;
}

export interface Context< T extends Comparable > {
  seq: Sequence< T >;
  bounds: Bounds;
  pushEdit: ( type: 0 | 1 | 2 ) => void;
  finish: () => Operation[];
}
