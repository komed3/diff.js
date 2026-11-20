import type { DiffAlgorithm } from '../types/algorithm';
import type { EditStep, Operation } from '../types/operation';


export class MyersAlgorithm implements DiffAlgorithm {
  public diff < T > (
    original: readonly T[], modified: readonly T[],
    equals: ( original: T, modified: T ) => boolean
  ) : Operation[] {}
}
