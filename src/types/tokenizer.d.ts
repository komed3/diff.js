import type { Token, TokenMeta } from './token';


export interface TokenizerOptions {
  locale?: string;
}

export interface Tokenizer< T extends TokenMeta = {} > {
  tokenize ( text: string ) : Token< T >[];
}
