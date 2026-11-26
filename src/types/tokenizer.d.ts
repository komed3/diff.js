export type TokenMeta = Record< string, unknown >;

export type Token< T extends TokenMeta = {} > = T & {
  readonly type: string;
  readonly value: string;
  readonly start: number;
  readonly end: number;
};

export interface TokenizerOptions {
  locale?: string;
}

export interface CustomTokenizerOptions< T extends TokenMeta = {} > {
  callback ( text: string ) : Token< T >[];
}

export interface Tokenizer< T extends TokenMeta = {} > {
  tokenize ( text: string ) : Token< T >[];
}
