import type { DiffMetricStats } from '../types/analyze';


export class DiffMagnitude {
  private readonly stats: DiffMetricStats;

  public constructor ( stats: DiffMetricStats ) {
    this.stats = stats;
  }

  public absolute () {}

  public relative () {}

  public percentage () {}

  public boxes () {}
}
