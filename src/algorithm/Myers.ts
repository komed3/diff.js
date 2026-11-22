import type { Algorithm } from '../types/algorithm';
import type { Operation } from '../types/operation';
import { createContext } from '../utils/createContext';
import { myersDiffRange } from '../utils/myersDiffRange';


export class Myers implements Algorithm {
  public diff < T > ( original: readonly T[], modified: readonly T[], equals: ( o: T, m: T ) => boolean ) : Operation[] {
    const { oStart, oEnd, mStart, mEnd, pushEdit, finish } = createContext( original, modified, equals );
    myersDiffRange( original, modified, equals, oStart, oEnd, mStart, mEnd, pushEdit );
    return finish();
  }
}
