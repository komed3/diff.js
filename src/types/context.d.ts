import type { Operation } from './operation';


export interface Input< T > {
  original: readonly T[];
  modified: readonly T[];
  equals: ( o: T, m: T ) => boolean;
  key?: ( value: T ) => unknown;
}

export interface Bounds {
  oStart: number;
  oEnd: number;
  mStart: number;
  mEnd: number;
}

export interface Context< T > {
  input: Input< T >;
  bounds: Bounds;
  pushEdit: ( type: 0 | 1 | 2 ) => void;
  finish: () => Operation[];
}
