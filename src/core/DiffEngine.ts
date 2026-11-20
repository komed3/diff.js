import type { DiffAlgorithm } from '../types/algorithm';
import type { DiffResult } from '../types/result';
import type { DiffTokenizer } from '../types/tokenizer';


export class DiffEngine< T extends Record< string, unknown > = {} > {
  private readonly tokenizer: DiffTokenizer< T >;
  private readonly algorithm: DiffAlgorithm;

  public constructor ( tokenizer: DiffTokenizer< T >, algorithm: DiffAlgorithm ) {
    this.tokenizer = tokenizer, this.algorithm = algorithm;
  }

  public diff ( original: string, modified: string ) : DiffResult< T > {
    const o = this.tokenizer.tokenize( original ), m = this.tokenizer.tokenize( modified );
    return { original: o, modified: m, operations: this.algorithm.diff( o, m ) };
  }
}
