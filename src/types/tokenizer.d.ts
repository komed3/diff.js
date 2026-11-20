import type { Token, TokenMeta } from './token';


export interface Tokenizer < T extends TokenMeta = {} > {
  tokenize ( text: string ) : Token< T >[];
}
