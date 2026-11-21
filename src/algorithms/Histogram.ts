import type { Algorithm, HistogramOptions } from '../types/algorithm';
import type { Operation } from '../types/operation';
import { Myers } from './Myers';


export class Histogram implements Algorithm {
  private readonly getKey?: ( value: unknown ) => PropertyKey;

  public constructor ( { getKey }: HistogramOptions = {} ) {
    this.getKey = getKey;
  }

  public diff < T > ( original: readonly T[], modified: readonly T[], equals: ( original: T, modified: T ) => boolean ) : Operation[] {
    const edits: ( 0 | 1 | 2 )[] = [], fallback = new Myers();
  }
}
