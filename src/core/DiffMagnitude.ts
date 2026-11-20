import type { DiffMetricStats } from '../types/analyze';
import type { DiffMagnitudeAbsolute, DiffMagnitudeAbsoluteOptions, DiffMagnitudeBase, DiffMagnitudeValue } from '../types/magnitude';


export class DiffMagnitude {
  private readonly stats: DiffMetricStats;

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

  public constructor ( stats: DiffMetricStats ) {
    this.stats = stats;
  }

  public absolute ( { metric }: DiffMagnitudeAbsoluteOptions ) : DiffMagnitudeAbsolute {
    return { value: this.getValue( metric ).value };
  }

  public relative () {}

  public percentage () {}

  public boxes () {}
}
