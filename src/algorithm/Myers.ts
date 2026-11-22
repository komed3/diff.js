import type { Algorithm } from '../types/algorithm';
import type { Operation } from '../types/operation';
import { createContext } from '../utils/createContext';
import { myersDiffRange } from '../utils/myersDiffRange';


export class Myers implements Algorithm {
  public diff < T > ( original: readonly T[], modified: readonly T[], equals: ( o: T, m: T ) => boolean ) : Operation[] {
    const ctx = createContext( original, modified, equals );
    const { oStart, oEnd, mStart, mEnd, pushEdit } = ctx;

    myersDiffRange( original, modified, equals, oStart, oEnd, mStart, mEnd, pushEdit );
    return ctx.finish();
  }
}
