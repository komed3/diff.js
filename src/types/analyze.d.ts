import type { Range } from './operation';


export interface MetricBaseStats {
  original: number;
  modified: number;
  equal: number;
  inserted: number;
  deleted: number;
  changed: number;
}

export interface MetricStats extends Readonly< MetricBaseStats > {
  readonly delta: number;
  readonly changeRate: number;
  readonly insertionRate: number;
  readonly deletionRate: number;
  readonly retentionRate: number;
  readonly growthRate: number | null;
  readonly sizeRatio: number | null;
}

export interface CharacterCounts {
  utf16CodeUnits: number;
  unicodeCodePoints: number;
  utf8Bytes: number;
}

export interface CharacterBaseMetric {
  original: number;
  modified: number;
  equal: {
    original: number;
    modified: number;
  };
  inserted: number;
  deleted: number;
  changed: {
    original: number;
    modified: number;
  };
}

export interface CharacterMetric extends Readonly< CharacterBaseMetric > {
  readonly delta: number;
  readonly changeRate: number;
}

export interface CharacterStats {
  readonly utf16CodeUnits: CharacterMetric;
  readonly unicodeCodePoints: CharacterMetric;
  readonly utf8Bytes: CharacterMetric;
}

export interface TokenStats {
  readonly lines: number;
  readonly coverage: number;
  readonly original: number;
  readonly modified: number;
  readonly equal: number;
  readonly inserted: number;
  readonly deleted: number;
  readonly changed: {
    readonly original: number;
    readonly modified: number;
  };
  readonly delta: number;
  readonly changeRate: number;
}

export interface OperationStats {
  readonly total: number;
  readonly equal: number;
  readonly insert: number;
  readonly delete: number;
  readonly change: number;
  readonly changes: number;
  readonly changeBlocks: number;
  readonly insertionBlocks: number;
  readonly deletionBlocks: number;
  readonly replacementBlocks: number;
  readonly insertionOnlyBlocks: number;
  readonly deletionOnlyBlocks: number;
  readonly changeOnlyBlocks: number;
  readonly mixedBlocks: number;
}

export type BlockType = 'insert' | 'delete' | 'replace' | 'change' | 'mixed';

export interface BlockBase {
  original: Range;
  modified: Range;
  insert: number;
  delete: number;
  change: number;
}

export interface Block extends Readonly< BlockBase > {
  readonly type: BlockType;
  readonly size: number;
  readonly churn: number;
}

export interface PatternRun {
  readonly type: 'equal' | 'insert' | 'delete' | 'change';
  readonly start: number;
  readonly length: number;
}

export interface PatternSequence {
  readonly pattern: string;
  readonly length: number;
  readonly count: number;
}

export interface PatternStats {
  readonly transitions: Readonly< Record< string, number > >;
  readonly sequences: readonly PatternSequence[];
  readonly runs: readonly PatternRun[];
  readonly longest: Readonly< Record< string, number > >;
}

export interface SideDistribution {
  readonly affected: number;
  readonly density: number;
  readonly coverage: number;
  readonly gaps: {
    readonly count: number;
    readonly min: number;
    readonly max: number;
    readonly average: number;
  };
}

export interface DistributionStats {
  readonly original: SideDistribution;
  readonly modified: SideDistribution;
  readonly concentration: number;
  readonly blockCount: number;
  readonly averageBlockSize: number;
  readonly largestBlock: number;
}
