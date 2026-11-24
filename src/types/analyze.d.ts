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
