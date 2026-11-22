import type { Algorithm } from '../types/algorithm';
import type { Operation } from '../types/operation';
import { createContext } from '../utils/createContext';
import { myersDiffRange } from '../utils/myersDiffRange';


export class Myers implements Algorithm {
  public diff < T > ( original: readonly T[], modified: readonly T[], equals: ( o: T, m: T ) => boolean ) : Operation[] {
    const context = createContext( original, modified, equals );

    myersDiffRange(
      original, modified, equals,
      context.oStart, context.oEnd, context.mStart, context.mEnd,
      context.pushEdit
    );

    return context.finish();
  }
}
