import type { LineScript, Result } from '../types/engine';
import type { SimilarityLine, SimilarityMode, SimilarityOptions, SimilarityWeight } from '../types/similarity';


export class Similarity {
  private readonly script: LineScript[];
  private readonly mode: SimilarityMode;
  private readonly weighting: SimilarityWeight;

  private readonly entries?: SimilarityLine[];

  public constructor ( { script }: Result, { mode = 'similarity', weighting = 'characters' }: SimilarityOptions = {} ) {
    this.script = script, this.mode = mode, this.weighting = weighting;
  }

  public lines () : SimilarityLine[] {
    return this.entries ??= ( () => {} );
  }
}
