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
}
