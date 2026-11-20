import type { DiffMetricStats } from '../types/analyze';
import type {
  DiffMagnitudeBase, DiffMagnitudeBoxesOptions, DiffMagnitudeMetric,
  DiffMagnitudeOptions, DiffMagnitudeResult
} from '../types/magnitude';


export class DiffMagnitude {
  private readonly stats: DiffMetricStats;

  public constructor ( stats: DiffMetricStats ) {
    this.stats = stats;
  }

  public getMagnitude ( metric: DiffMagnitudeMetric, options: DiffMagnitudeOptions ) : DiffMagnitudeResult {
    const value = this.stats[ metric ];

    if ( options.mode === 'absolute' ) return { mode: 'absolute', value };

    const base = options.base ?? 'original';
    const baseValue = this.getBaseValue( base );
    const ratio = value === null || baseValue === 0 ? null : value / baseValue;

    if ( options.mode === 'relative' ) return { mode: 'relative', value: ratio, base, baseValue };

    if ( options.mode === 'percentage' ) {
      const precision = options.precision ?? 1;

      if ( ! Number.isInteger( precision ) || precision < 0 || precision > 10 )
        throw new RangeError( 'Percentage precision must be an integer between 0 and 10' );

      const factor = 10 ** precision;

      return {
        mode: 'percentage',
        value: ratio === null ? null : Math.round( ratio * 100 * factor ) / factor,
        base, baseValue, precision
      };
    }

    const boxes = options.boxes ?? 10;

    if ( ! Number.isInteger( boxes ) || boxes < 1 )
      throw new RangeError( 'The number of boxes must be a positive integer' );

    const fillRate = ratio === null ? null : Math.min( 1, Math.abs( ratio ) );
    const filled = fillRate === null ? null : Math[ options.rounding ?? 'round' ]( fillRate * boxes );

    return {
      mode: 'boxes',
      value,
      base,
      baseValue,
      ratio,
      filled,
      empty: filled === null ? null : boxes - filled,
      total: boxes,
      direction: value === null ? null : value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral'
    };
  }
}
