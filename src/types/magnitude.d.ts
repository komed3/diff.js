import type { DiffMetricStats } from './analyze';


export type DiffMagnitudeBase = 'original' | 'modified' | 'combined' | 'maximum' | number;

export interface DiffMagnitudeOptions {
  metric?: keyof DiffMetricStats;
  base?: DiffMagnitudeBase;
}

export interface DiffMagnitudePercentageOptions extends DiffMagnitudeOptions {
  precision?: number;
}

export interface DiffMagnitudeBoxesOptions extends DiffMagnitudeOptions {
  total?: number;
}

export interface DiffMagnitudeValue {
  readonly value: number | null;
  readonly baseValue: number;
}

export interface DiffMagnitudeAbsolute extends DiffMagnitudeValue {
  readonly magnitude: number | null;
}

export interface DiffMagnitudeRelative extends DiffMagnitudeValue {
  readonly ratio: number | null;
}

export interface DiffMagnitudePercentage extends DiffMagnitudeValue {
  readonly percentage: number | null;
}

export interface DiffMagnitudeBoxes extends DiffMagnitudeValue {
  readonly filled: number | null;
  readonly empty: number | null;
  readonly total: number;
}
