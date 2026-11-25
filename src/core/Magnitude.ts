import type { MetricStats } from '../types/analyze';
import type { HunkData } from '../types/hunk';
import type {
  MagnitudeAbsolute, MagnitudeBoxes, MagnitudeBoxesOptions, MagnitudeOptions,
  MagnitudePercentage, MagnitudePercentageOptions, MagnitudeRelative, MagnitudeValue
} from '../types/magnitude';


export class Magnitude {
  private readonly stats: MetricStats;
  private readonly operations = { insert: 0, delete: 0, change: 0 };

  public constructor ( hunks: readonly HunkData[], stats: MetricStats ) {
    this.stats = stats;

    for ( const { lines } of hunks ) for ( const { operation: { type } } of lines )
      if ( type !== 'equal' ) this.operations[ type ]++;
  }
}
