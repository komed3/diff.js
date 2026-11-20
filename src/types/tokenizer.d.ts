import type { Token } from './token';


export interface Tokenizer< T extends Record< string, unknown > = {} > {
  tokenize ( text: string ) : Token< T >[];
}
