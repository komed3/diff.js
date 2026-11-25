export type HeatmapFilter = 'all' | 'insert' | 'delete' | 'change';
export type HeatmapDimension = number | 'auto';

export interface HeatmapOptions {
  x?: HeatmapDimension;
  y?: HeatmapDimension;
  filter?: HeatmapFilter;
}
