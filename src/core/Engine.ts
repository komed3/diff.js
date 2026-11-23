import type { Algorithm } from '../types/algorithm';
import type { Comparable, Comparator, Sequence } from '../types/context';
import type { EngineOptions, EditScript, Input, LineScript, Result } from '../types/engine';
import type { Line } from '../types/line';
import type { Operation } from '../types/operation';
import type { Token } from '../types/token';
import { LineParser } from './LineParser';


export class Engine {
  private readonly parser = new LineParser();

  private seq < T extends Comparable > ( original: readonly T[], modified: readonly T[], comparator?: Comparator< T > ) : Sequence< T > {}

  public constructor ( private readonly options: EngineOptions ) {}

  public process ( input: Input ) : Result {}
}
