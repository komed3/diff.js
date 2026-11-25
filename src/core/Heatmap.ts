import type { HeatmapCell, HeatmapData, HeatmapOptions } from '../types/heatmap';
import type { Result } from '../types/engine';
import type { Line } from '../types/line';
import type { Token } from '../types/token';


export class Heatmap {
  public constructor ( private readonly result: Result ) {}
}
