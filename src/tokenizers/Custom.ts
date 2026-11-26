import type { CustomTokenizerOptions, Token, Tokenizer, TokenMeta } from '../types/tokenizer';


export class Custom< T extends TokenMeta = {} > implements Tokenizer< T > {
  private readonly callback: ( text: string ) => Token< T >[];

  public constructor ( { callback }: CustomTokenizerOptions< T > ) {
    this.callback = callback;
  }

  public tokenize ( text: string ) : Token< T >[] {
    return this.callback( text );
  }
}
