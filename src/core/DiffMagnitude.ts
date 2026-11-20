import type { DiffMetricStats } from '../types/analyze';
import type {
  DiffMagnitudeAbsolute, DiffMagnitudeBoxes, DiffMagnitudeBoxesOptions, DiffMagnitudeOptions,
  DiffMagnitudePercentage, DiffMagnitudePercentageOptions, DiffMagnitudeRelative, DiffMagnitudeValue
} from '../types/magnitude';


export class DiffMagnitude {
  private readonly stats: DiffMetricStats;

  private getValue ( { metric = 'changed', base = 'original' }: DiffMagnitudeOptions = {} ) : DiffMagnitudeValue {
    return {
      value: this.stats[ metric ],
      baseValue: typeof base === 'number' ? base : base === 'original' ? this.stats.original
        : base === 'modified' ? this.stats.modified
        : base === 'combined' ? this.stats.original + this.stats.modified
        : Math.max( this.stats.original, this.stats.modified )
    };
  }

  public constructor ( stats: DiffMetricStats ) {
    this.stats = stats;
  }

  public absolute ( options: DiffMagnitudeOptions = {} ) : DiffMagnitudeAbsolute {
    const { value, baseValue } = this.getValue( options );
    return { value, baseValue, magnitude: value === null ? null : Math.abs( value ) };
  }

  public relative ( options: DiffMagnitudeOptions = {} ) : DiffMagnitudeRelative {
    const { value, baseValue } = this.getValue( options );
    return { value, baseValue, ratio: value === null || baseValue === 0 ? null : value / baseValue };
  }

  public percentage ( { precision = 1, ...options }: DiffMagnitudePercentageOptions = {} ) : DiffMagnitudePercentage {
    const { value, baseValue } = this.getValue( options ), factor = 10 ** precision;

    return {
      value, baseValue,
      percentage: value === null || baseValue === 0 ? null
        : Math.round( value / baseValue * 100 * factor ) / factor
    };
  }

  public boxes ( { total = 10, ...options }: DiffMagnitudeBoxesOptions = {} ) : DiffMagnitudeBoxes {
    const { value, baseValue } = this.getValue( options );
    const ratio = value === null || baseValue === 0 ? null : Math.abs( value / baseValue );
    const filled = ratio === null ? null : Math.min( total, Math.round( ratio * total ) );

    return { value, baseValue, filled, empty: filled === null ? null : total - filled, total };
  }
}
