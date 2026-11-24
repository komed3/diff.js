import type {
  Block, BlockType, CharacterCounts, CharacterMetric, CharacterStats, DistributionStats,
  MetricStats, OperationStats, PatternRun, PatternSequence, PatternStats, SideDistribution,
  TokenStats
} from '../types/analyze';
import type { LineScript, Result } from '../types/engine';
import type { Range } from '../types/operation';


export class Analyzer {
  private readonly result: Result;
  private encoder?: TextEncoder;
}
