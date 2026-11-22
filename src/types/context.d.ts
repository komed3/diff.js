import type { Operation } from './operation';


export interface Bounds {
  oStart: number;
  oEnd: number;
  mStart: number;
  mEnd: number;
}

export interface Context< T > {
  bounds: Bounds;
  original: readonly T[];
  modified: readonly T[];
  equals: ( o: T, m: T ) => boolean;
  pushEdit: ( type: 0 | 1 | 2 ) => void;
  finish: () => Operation[];
}
