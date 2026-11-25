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

  public relative ( options: MagnitudeOptions = {} ) : MagnitudeRelative {
    const { value, baseValue } = this.getValue( options );
    return { value, baseValue, ratio: value === null || baseValue === 0 ? null : value / baseValue };
  }

  public percentage ( { precision = 1, ...options }: MagnitudePercentageOptions = {} ) : MagnitudePercentage {
    const { value, baseValue } = this.getValue( options ), factor = 10 ** precision;
    return { value, baseValue, percentage: value === null || baseValue === 0 ? null
      : Math.round( value / baseValue * 100 * factor ) / factor
    };
  }

  public boxes ( { total = 5, ...options }: MagnitudeBoxesOptions = {} ) : MagnitudeBoxes {
    const { value, baseValue } = this.getValue( options );
    const ratio = value === null || baseValue === 0 ? null : Math.abs( value / baseValue );
    const filled = ratio === null ? null : Math.min( total, Math.round( ratio * total ) );

    return {
      value, baseValue, ...this.operations,
      filled, empty: filled === null ? null : total - filled, total
    };
  }
}
