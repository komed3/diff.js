import type { DiffMetricStats } from '../types/analyze';
import type {
  DiffMagnitudeAbsolute, DiffMagnitudeBoxes, DiffMagnitudeOptions,
  DiffMagnitudePercentage, DiffMagnitudeRelative, DiffMagnitudeResult
} from '../types/magnitude';


export class DiffMagnitude {
  private readonly stats: DiffMetricStats;

  public constructor ( stats: DiffMetricStats ) {
    this.stats = stats;
  }

  public getMagnitude ( {
    metric, mode = 'absolute', base = 'original', boxes = 10,
    precision = 1, rounding = 'round'
  }: DiffMagnitudeOptions ) : DiffMagnitudeResult {
    const value = this.stats[ metric ];
    const baseValue = typeof base === 'number' ? base : base === 'original' ? this.stats.original
      : base === 'modified' ? this.stats.modified
      : base === 'combined' ? this.stats.original + this.stats.modified
      : Math.max( this.stats.original, this.stats.modified );

    if ( ! Number.isFinite( baseValue ) || baseValue < 0 )
      throw new RangeError( 'Magnitude base must be a finite non-negative number' );

    if ( ! Number.isInteger( precision ) || precision < 0 || precision > 10 )
      throw new RangeError( 'Precision must be an integer between 0 and 10' );

    if ( ! Number.isInteger( boxes ) || boxes < 1 )
      throw new RangeError( 'The number of boxes must be a positive integer' );

    const ratio = value === null || baseValue === 0 ? null : value / baseValue;

    if ( mode === 'absolute' ) return { value } as DiffMagnitudeAbsolute;
    if ( mode === 'relative' ) return { value: ratio, ratio, base: baseValue } as DiffMagnitudeRelative;

    if ( mode === 'percentage' ) {
      const factor = 10 ** precision;
      const percentage = ratio === null ? null : Math.round( ratio * 100 * factor ) / factor;

      return { value: percentage, ratio, base: baseValue, precision } as DiffMagnitudePercentage;
    }

    const fillRate = ratio === null ? null : Math.min( 1, Math.abs( ratio ) );
    const filled = fillRate === null ? null : Math[ rounding ]( fillRate * boxes );

    return {
      value, ratio, base: baseValue, filled, empty: filled === null ? null : boxes - filled, total: boxes,
      direction: value === null ? null : value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral'
    } as DiffMagnitudeBoxes;
  }
}
