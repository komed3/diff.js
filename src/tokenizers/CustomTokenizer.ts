import type { DiffToken } from '../types/token';
import type { DiffTokenizer } from '../types/tokenizer';


export class CustomTokenizer< T extends Record< string, unknown > = {} > implements DiffTokenizer< T > {
  private readonly callback: ( text: string ) => DiffToken< T >[];

  public constructor ( callback: ( text: string ) => DiffToken< T >[] ) {
    this.callback = callback;
  }

  public tokenize ( text: string ) : DiffToken< T >[] {
    return this.callback( text );
  }
}
