import type { Algorithm } from './algorithm';
import type { Line } from './line';
import type { Operation } from './operation';
import type { Token } from './token';
import type { Tokenizer } from './tokenizer';


export interface EngineOptions< T > {
  algorithm: Algorithm;
  equals: ( o: T, m: T ) => boolean;
  key?: ( value: T ) => unknown;
  tokenizer?: Tokenizer;
  tokenAlgorithm?: Algorithm;
}

export interface EditScript {
  original: Token[];
  modified: Token[];
  operations: Operation[];
}

export interface LineScript {
  original: Line | null;
  modified: Line | null;
  operation: Operation;
  edit?: EditScript;
}

export interface Input< T > {
  original: T;
  modified: T;
}

export interface Result< T > {
  original: T;
  modified: T;
  script: LineScript[];
}
