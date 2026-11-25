import type { MetricStats } from './analyze';


export type MagnitudeBase = 'original' | 'modified' | 'combined' | 'maximum' | number;

export interface MagnitudeOptions {
  metric?: keyof MetricStats;
  base?: MagnitudeBase;
}

export interface MagnitudePercentageOptions extends MagnitudeOptions {
  precision?: number;
}

export interface MagnitudeBoxesOptions extends MagnitudeOptions {
  total?: number;
}

export interface MagnitudeValue {
  readonly value: number | null;
  readonly baseValue: number;
}

export interface MagnitudeAbsolute extends MagnitudeValue {
  readonly magnitude: number | null;
}

export interface MagnitudeRelative extends MagnitudeValue {
  readonly ratio: number | null;
}

export interface MagnitudePercentage extends MagnitudeValue {
  readonly percentage: number | null;
}

export interface MagnitudeBoxes extends MagnitudeValue {
  readonly insert: number;
  readonly delete: number;
  readonly change: number;
  readonly filled: number | null;
  readonly empty: number | null;
  readonly total: number;
}
