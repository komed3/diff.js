import type { HeatmapCell, HeatmapData, HeatmapOptions } from '../types/heatmap';
import type { Result } from '../types/engine';
import type { Line } from '../types/line';
import type { Token } from '../types/token';


export class Heatmap {
  public constructor ( private readonly result: Result ) {}

  public create ( { x = 'auto', y = 'auto', filter = 'all' }: HeatmapOptions = {} ) : HeatmapData {
    let maxWidth = 1, originalLines = 1, modifiedLines = 1;
  }
}
