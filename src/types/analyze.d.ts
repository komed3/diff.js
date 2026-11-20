export interface MetricStats {
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

export interface TokenStats extends MetricStats {}

export interface CharacterStats {
  readonly utf16CodeUnits: MetricStats;
  readonly unicodeCodePoints: MetricStats;
  readonly utf8Bytes: MetricStats;
}

export interface OperationStats {
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

export interface CharacterCounts {
  utf16CodeUnits: number;
  unicodeCodePoints: number;
  utf8Bytes: number;
}
