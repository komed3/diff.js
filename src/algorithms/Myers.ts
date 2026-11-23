import type { Algorithm } from '../types/algorithm';
import type { Comparable, Sequence } from '../types/context';
import type { Operation } from '../types/operation';
import { createContext } from './internal/createContext';
import { myersDiffRange } from './internal/myersDiffRange';


export class Myers implements Algorithm {
  public diff < T extends Comparable > ( seq: Sequence< T > ) : Operation[] {
    const { bounds, pushEdit, finish } = createContext( seq );

    myersDiffRange( seq, bounds, pushEdit );
    return finish();
  }
}
