import type { Algorithm } from './algorithm';
import type { Input } from './context';
import type { Line } from './line';
import type { Operation } from './operation';
import type { Token } from './token';
import type { Tokenizer } from './tokenizer';


export interface EngineOptions< T > {
  input: Input< T >;
  algorithm: Algorithm;
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

export interface Result {
  original: string;
  modified: string;
  script: LineScript[];
}
