import type { Algorithm } from '../types/algorithm';
import type { Operation } from '../types/operation';
import { commonEdges } from '../utils/commonEdges';


export class Myers implements Algorithm {
  public diff < T > ( original: readonly T[], modified: readonly T[], equals: ( o: T, m: T ) => boolean ) : Operation[] {
    const [ n, m ] = [ original.length, modified.length ];
    const { prefix, suffix } = commonEdges( original, modified, equals );
    const editCodes = new Int8Array( n + m + 1 ), editCount = n + m + 1;
    let editStart = editCount;
  }
}
