export type HeatmapFilter = 'all' | 'insert' | 'delete' | 'change';
export type HeatmapDimension = number | 'auto';

export interface HeatmapOptions {
  x?: HeatmapDimension;
  y?: HeatmapDimension;
  filter?: HeatmapFilter;
}

export interface HeatmapCell {
  readonly x: number;
  readonly y: number;
  readonly intensity: number;
  readonly activity: number;
  readonly insert: number;
  readonly delete: number;
  readonly change: number;
}

export interface HeatmapData {
  readonly width: number;
  readonly height: number;
  readonly cells: readonly HeatmapCell[];
}
