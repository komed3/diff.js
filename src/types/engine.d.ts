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
