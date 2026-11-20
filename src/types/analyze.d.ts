export interface DiffMetricStats {
  readonly original: number;
  readonly modified: number;
  readonly equal: number;
  readonly inserted: number;
  readonly deleted: number;
  readonly changed: number;
  readonly delta: number;
  readonly changeRate: number;
  readonly insertionRate: number;
  readonly deletionRate: number;
  readonly retentionRate: number;
  readonly similarity: number;
  readonly growthRate: number | null;
  readonly sizeRatio: number | null;
}

export interface DiffTokenStats extends DiffMetricStats {}

export interface DiffCharacterStats {
  readonly utf16CodeUnits: DiffMetricStats;
  readonly unicodeCodePoints: DiffMetricStats;
  readonly utf8Bytes: DiffMetricStats;
}

export interface DiffOperationStats {
  readonly total: number;
  readonly equal: number;
  readonly insert: number;
  readonly delete: number;
  readonly changes: number;
  readonly changeBlocks: number;
  readonly insertionBlocks: number;
  readonly deletionBlocks: number;
  readonly replacementBlocks: number;
  readonly insertionOnlyBlocks: number;
  readonly deletionOnlyBlocks: number;
}

export interface DiffCharacterCounts {
  readonly utf16CodeUnits: number;
  readonly unicodeCodePoints: number;
  readonly utf8Bytes: number;
}
