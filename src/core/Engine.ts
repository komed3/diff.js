import type { Algorithm } from '../types/algorithm';
import type { Result } from '../types/result';
import type { Tokenizer } from '../types/tokenizer';


export class Engine< T extends Record< string, unknown > = {} > {
  private readonly tokenizer: Tokenizer< T >;
  private readonly algorithm: Algorithm;

  public constructor ( tokenizer: Tokenizer< T >, algorithm: Algorithm ) {
    this.tokenizer = tokenizer, this.algorithm = algorithm;
  }

  public diff ( original: string, modified: string ) : Result< T > {
    const o = this.tokenizer.tokenize( original ), m = this.tokenizer.tokenize( modified );
    return { original: o, modified: m, operations: this.algorithm.diff( o, m ) };
  }
}
