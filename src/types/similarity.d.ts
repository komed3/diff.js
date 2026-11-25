export type SimilarityMode = 'retention' | 'similarity' | 'combined';
export type SimilarityWeight = 'lines' | 'characters';

export interface SimilarityOptions {
  mode?: SimilarityMode;
  weighting?: SimilarityWeight;
}

export interface SimilarityLine {
  readonly original: number | null;
  readonly modified: number | null;
  readonly type: 'equal' | 'insert' | 'delete' | 'change';
  readonly originalLength: number;
  readonly modifiedLength: number;
  readonly commonLength: number | null;
  readonly retention: number | null;
  readonly similarity: number | null;
  readonly combined: number | null;
}
