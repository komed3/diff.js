import type { MetricStats } from '../types/analyze';
import type { HunkData } from '../types/hunk';
import type {
  MagnitudeAbsolute, MagnitudeBoxes, MagnitudeBoxesOptions, MagnitudeOptions,
  MagnitudePercentage, MagnitudePercentageOptions, MagnitudeRelative, MagnitudeValue
} from '../types/magnitude';


export class Magnitude {
  private readonly stats: MetricStats;
  private readonly operations = { insert: 0, delete: 0, change: 0 };

  private getValue ( { metric = 'changed', base = 'original' }: MagnitudeOptions = {} ) : MagnitudeValue {
    return { value: this.stats[ metric ], baseValue: typeof base === 'number' ? base
      : base === 'original' ? this.stats.original : base === 'modified' ? this.stats.modified
      : base === 'combined' ? this.stats.original + this.stats.modified
      : Math.max( this.stats.original, this.stats.modified )
    };
  }

  public constructor ( hunks: readonly HunkData[], stats: MetricStats ) {
    this.stats = stats;

    for ( const { lines } of hunks ) for ( const { operation: { type } } of lines )
      if ( type !== 'equal' ) this.operations[ type ]++;
  }

  public absolute ( options: MagnitudeOptions = {} ) : MagnitudeAbsolute {
    const { value, baseValue } = this.getValue( options );
    return { value, baseValue, magnitude: value === null ? null : Math.abs( value ) };
  }
}
