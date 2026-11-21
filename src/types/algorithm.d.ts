import type { Operation } from './operation';


export interface Algorithm {
  diff < T > (
    original: readonly T[],
    modified: readonly T[],
    equals: ( original: T, modified: T ) => boolean
  ) : Operation[];
}

export interface MyersOptions {
  readonly mode?: 'fast' | 'minimal';
}

export interface HuntSzymanskiOptions {
  readonly getKey?: ( value: unknown ) => PropertyKey;
}
