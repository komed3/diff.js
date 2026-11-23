import type { Token, TokenMeta } from './token';


export interface TokenizerOptions {
  locale?: string;
}

export interface CustomTokenizerOptions< T extends TokenMeta = {} > {
  callback ( text: string ) : Token< T >[];
}

export interface Tokenizer< T extends TokenMeta = {} > {
  tokenize ( text: string ) : Token< T >[];
}
