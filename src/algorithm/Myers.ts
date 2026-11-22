import type { Algorithm } from '../types/algorithm';
import type { Input } from '../types/context';
import type { Operation } from '../types/operation';
import { createContext } from './internal/createContext';
import { myersDiffRange } from './internal/myersDiffRange';


export class Myers implements Algorithm {
  public diff < T > ( input: Input< T > ) : Operation[] {
    const context = createContext( input );

    myersDiffRange( context );
    return context.finish();
  }
}
