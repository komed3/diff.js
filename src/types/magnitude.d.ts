import type { DiffMetricStats } from './analyze';


export type DiffMagnitudeBase = 'original' | 'modified' | 'combined' | 'maximum' | number;

export interface DiffMagnitudeValue {
  value: number | null;
  baseValue: number;
}

export interface DiffMagnitudeAbsoluteOptions {
  metric?: keyof DiffMetricStats;
}

export interface DiffMagnitudeAbsolute {
  readonly value: number | null;
}
