import type { LineOperation, Operation } from './operation';


export interface LineSimilarity {
  readonly original: number | null;
  readonly modified: number | null;
  readonly type: LineOperation[ 'type' ];
  readonly similarity: number;
}

export interface TokenSimilarity {
  readonly originalLine: number;
  readonly modifiedLine: number;
  readonly original: number | null;
  readonly modified: number | null;
  readonly type: Operation[ 'type' ];
  readonly similarity: number;
}
