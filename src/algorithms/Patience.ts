import type { Algorithm } from '../types/algorithm';
import type { Input } from '../types/context';
import type { Operation } from '../types/operation';
import { anchoredDiff } from './internal/anchoredDiff';
import { findAnchors } from './internal/findAnchors';
import { longestIncreasingSubsequence } from './internal/longestIncreasingSubsequence';


export class Patience implements Algorithm {
  public diff < T > ( input: Input< T > ) : Operation[] {
    return anchoredDiff( input, ( i, b ) => longestIncreasingSubsequence( findAnchors( i, b ) ) );
  }
}
