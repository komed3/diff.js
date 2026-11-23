import type { Algorithm } from './algorithm';
import type { Comparator } from './context';
import type { Line } from './line';
import type { LineOperation, Operation } from './operation';
import type { Token } from './token';
import type { Tokenizer } from './tokenizer';


export interface EngineOptions {
  algorithm: Algorithm;
  comparator?: Comparator< Line >;

  tokenizer?: Tokenizer;
  tokenAlgorithm?: Algorithm;
  tokenComparator?: Comparator< Token >;
}

export interface EditScript {
  original: Token[];
  modified: Token[];
  operations: Operation[];
}

export interface LineScript {
  original: Line | null;
  modified: Line | null;
  operation: LineOperation;
  edit?: EditScript;
}

export interface Input {
  original: string;
  modified: string;
}

export interface Result {
  original: string;
  modified: string;
  script: LineScript[];
}
