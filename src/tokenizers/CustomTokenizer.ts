import type { Token } from '../types/token';
import type { Tokenizer } from '../types/tokenizer';


export class CustomTokenizer< T extends Record< string, unknown > = {} > implements Tokenizer< T > {
  private readonly callback: ( text: string ) => Token< T >[];

  public constructor ( callback: ( text: string ) => Token< T >[] ) {
    this.callback = callback;
  }

  public tokenize ( text: string ) : Token< T >[] {
    return this.callback( text );
  }
}
