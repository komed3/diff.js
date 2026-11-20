import type { DiffMetricStats } from './analyze';


export type DiffMagnitudeMetric = keyof DiffMetricStats;
export type DiffMagnitudeBase = 'original' | 'modified' | 'combined' | 'maximum' | number;
export type DiffMagnitudeRounding = 'floor' | 'round' | 'ceil';

export interface DiffMagnitudeAbsoluteOptions {
  readonly mode: 'absolute';
}

export interface DiffMagnitudeRelativeOptions {
  readonly mode: 'relative';
  readonly base?: DiffMagnitudeBase;
}

export interface DiffMagnitudePercentageOptions {
  readonly mode: 'percentage';
  readonly base?: DiffMagnitudeBase;
  readonly precision?: number;
}

export interface DiffMagnitudeBoxesOptions {
  readonly mode: 'boxes';
  readonly base?: DiffMagnitudeBase;
  readonly boxes?: number;
  readonly rounding?: DiffMagnitudeRounding;
}

export type DiffMagnitudeOptions =
  | DiffMagnitudeAbsoluteOptions
  | DiffMagnitudeRelativeOptions
  | DiffMagnitudePercentageOptions
  | DiffMagnitudeBoxesOptions;

export interface DiffMagnitudeAbsolute {
  readonly mode: 'absolute';
  readonly value: number | null;
}

export interface DiffMagnitudeRelative {
  readonly mode: 'relative';
  readonly value: number | null;
  readonly base: DiffMagnitudeBase;
  readonly baseValue: number;
}

export interface DiffMagnitudePercentage {
  readonly mode: 'percentage';
  readonly value: number | null;
  readonly base: DiffMagnitudeBase;
  readonly baseValue: number;
  readonly precision: number;
}

export interface DiffMagnitudeBoxes {
  readonly mode: 'boxes';
  readonly value: number | null;
  readonly base: DiffMagnitudeBase;
  readonly baseValue: number;
  readonly ratio: number | null;
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
