import type { Token, TokenBaseMeta } from './token';


export interface Tokenizer< T extends TokenBaseMeta = {} > {
  tokenize ( text: string ) : Token< T >[];
}
