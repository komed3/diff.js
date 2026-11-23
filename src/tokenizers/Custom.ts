import type { Token, TokenMeta } from '../types/token';
import type { Tokenizer } from '../types/tokenizer';


export class Custom< T extends TokenMeta = {} > implements Tokenizer< T > {
  private readonly callback: ( text: string ) => Token< T >[];
}
