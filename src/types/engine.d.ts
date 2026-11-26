import type { Algorithm } from './algorithm';
import type { Comparator } from './comparator';
import type { Line } from './line';
import type { LineOperation, Operation } from './operation';
import type { Token, Tokenizer, TokenMeta } from './tokenizer';


export interface EngineOptions< T extends TokenMeta = {} > {
  algorithm: Algorithm;
  comparator?: Comparator< Line >;

  tokenizer?: Tokenizer< T >;
  tokenAlgorithm?: Algorithm;
  tokenComparator?: Comparator< Token< T > >;
}

export interface EditScript< T extends TokenMeta = {} > {
  original: Token< T >[];
  modified: Token< T >[];
  operations: Operation[];
}

export interface LineScript< T extends TokenMeta = {} > {
  original: Line | null;
  modified: Line | null;
  operation: LineOperation;
  edit?: EditScript< T >;
}

export interface Input {
  original: string;
  modified: string;
}

export interface Result< T extends TokenMeta = {} > {
  original: string;
  modified: string;
  script: LineScript< T >[];
}
