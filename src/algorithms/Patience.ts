import type { Algorithm } from '../types/algorithm';
import type { Comparable, Sequence } from '../types/context';
import type { Operation } from '../types/operation';
import { anchoredDiff } from './internal/anchoredDiff';
import { findAnchors } from './internal/findAnchors';
import { longestIncreasingSubsequence } from './internal/longestIncreasingSubsequence';


export class Patience implements Algorithm {
  public diff < T extends Comparable > ( seq: Sequence< T > ) : Operation[] {
    return anchoredDiff( seq, ( part, bounds ) => longestIncreasingSubsequence( findAnchors( part, bounds ) ) );
  }
}
