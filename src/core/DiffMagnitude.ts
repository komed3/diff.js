import type { DiffMetricStats } from '../types/analyze';
import type {
  DiffMagnitudeAbsolute, DiffMagnitudeBase, DiffMagnitudeBoxes, DiffMagnitudeBoxesOptions, DiffMagnitudeOptions,
  DiffMagnitudePercentage, DiffMagnitudePercentageOptions, DiffMagnitudeRelative, DiffMagnitudeValue
} from '../types/magnitude';


export class DiffMagnitude {
  private readonly stats: DiffMetricStats;

  public constructor ( stats: DiffMetricStats ) {
    this.stats = stats;
  }

  private getValue (
    metric: keyof DiffMetricStats = 'changed',
    base: DiffMagnitudeBase = 'original'
  ) : DiffMagnitudeValue {
    return {
      value: this.stats[ metric ],
      baseValue: typeof base === 'number' ? base : base === 'original' ? this.stats.original
        : base === 'modified' ? this.stats.modified
        : base === 'combined' ? this.stats.original + this.stats.modified
        : Math.max( this.stats.original, this.stats.modified )
    };
  }

  public absolute ( { metric, base }: DiffMagnitudeOptions = {} ) : DiffMagnitudeAbsolute {
    const { value, baseValue } = this.getValue( metric, base );
    return { value, baseValue, magnitude: value === null ? null : Math.abs( value ) };
  }

  public relative ( { metric, base }: DiffMagnitudeOptions = {} ) : DiffMagnitudeRelative {
    const { value, baseValue } = this.getValue( metric, base );
    return { value, baseValue, ratio: value === null || baseValue === 0 ? null : value / baseValue };
  }

  public percentage ( { metric, base, precision = 1 }: DiffMagnitudePercentageOptions = {} ) : DiffMagnitudePercentage {
    const { value, baseValue } = this.getValue( metric, base ), factor = 10 ** precision;

    return {
      value, baseValue,
      percentage: value === null || baseValue === 0 ? null
        : Math.round( value / baseValue * 100 * factor ) / factor
    };
  }

  public boxes ( { metric, base, total = 10 }: DiffMagnitudeBoxesOptions = {} ) : DiffMagnitudeBoxes {
    const { value, baseValue } = this.getValue( metric, base );
    const ratio = value === null || baseValue === 0 ? null : Math.abs( value / baseValue );
    const filled = ratio === null ? null : Math.min( total, Math.round( ratio * total ) );

    return { value, baseValue, filled, empty: filled === null ? null : total - filled, total };
  }
}
