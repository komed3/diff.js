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
