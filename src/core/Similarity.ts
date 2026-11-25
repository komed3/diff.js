import type { EditScript, Result } from '../types/engine';
import type { LineSimilarity, TokenSimilarity } from '../types/similarity';


export class Similarity {
  public constructor ( private readonly result: Result ) {}
}
