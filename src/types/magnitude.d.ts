import type { DiffMetricStats } from './analyze';


export interface DiffMagnitudeOptions {
  metric: keyof DiffMetricStats;
  mode?: 'absolute' | 'relative' | 'percentage' | 'boxes';
  base?: 'original' | 'modified' | 'combined' | 'maximum' | number;
  boxes?: number;
  precision?: number;
  rounding?: 'floor' | 'round' | 'ceil';
}

export interface DiffMagnitudeAbsolute {
  readonly value: number | null;
}

export interface DiffMagnitudeRelative {
  readonly value: number | null;
  readonly ratio: number | null;
  readonly base: number;
}

export interface DiffMagnitudePercentage {
  readonly value: number | null;
  readonly ratio: number | null;
  readonly base: number;
  readonly precision: number;
}

export interface DiffMagnitudeBoxes {
  readonly value: number | null;
  readonly ratio: number | null;
  readonly base: number;
  readonly filled: number | null;
  readonly empty: number | null;
  readonly total: number;
  readonly direction: 'positive' | 'negative' | 'neutral' | null;
}

export type DiffMagnitudeResult =
  | DiffMagnitudeAbsolute
  | DiffMagnitudeRelative
  | DiffMagnitudePercentage
  | DiffMagnitudeBoxes;
