export type SimilarityMode = 'retention' | 'similarity' | 'combined';
export type SimilarityWeight = 'lines' | 'characters';

export interface SimilarityOptions {
  mode?: SimilarityMode;
  weighting?: SimilarityWeight;
}
