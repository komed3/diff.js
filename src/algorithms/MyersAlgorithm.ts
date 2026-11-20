import type { DiffAlgorithm } from '../types/algorithm';
import type { EditStep, Operation } from '../types/operation';


export class MyersAlgorithm implements DiffAlgorithm {
  public diff < T > (
    original: readonly T[], modified: readonly T[],
    equals: ( original: T, modified: T ) => boolean
  ) : Operation[] {
    const n = original.length, m = modified.length;
    let prefix = 0, suffix = 0;

    while (
      prefix < n && prefix < m &&
      equals( original[ prefix ], modified[ prefix ] )
    ) prefix++;

    while (
      suffix < n - prefix && suffix < m - prefix &&
      equals( original[ n - suffix - 1 ], modified[ m - suffix - 1 ] )
    ) suffix++;
  }
}
