import type { SimilarityLine, SimilarityMode, SimilarityOptions, SimilarityWeight } from '../types/similarity';
import type { LineScript, Result } from '../types/engine';


export class Similarity {
  private readonly entries: SimilarityLine[];
  private readonly mode: SimilarityMode;
  private readonly weighting: SimilarityWeight;

  public constructor ( { script }: Result, { mode = 'similarity', weighting = 'characters' }: SimilarityOptions = {} ) {
    this.mode = mode, this.weighting = weighting;
  }
}
