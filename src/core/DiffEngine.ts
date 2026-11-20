import type { DiffAlgorithm } from '../types/algorithm';
import type { DiffResult } from '../types/result';
import type { DiffToken } from '../types/token';
import type { DiffTokenizer } from '../types/tokenizer';


export class DiffEngine< T extends Record< string, unknown > = {} > {
  private readonly tokenizer: DiffTokenizer< T >;
  private readonly algorithm: DiffAlgorithm;
}
