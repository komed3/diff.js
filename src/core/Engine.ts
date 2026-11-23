import type { Algorithm } from '../types/algorithm';
import type { Comparable, Comparator, Sequence } from '../types/context';
import type { EngineOptions, EditScript, Input, LineScript, Result } from '../types/engine';
import type { Line } from '../types/line';
import type { Operation } from '../types/operation';
import type { Token } from '../types/token';
import { LineParser } from './LineParser';


export class Engine {
  private readonly parser = new LineParser();

  private seq < T extends Comparable > ( original: readonly T[], modified: readonly T[], comparator?: Comparator< T > ) : Sequence< T > {
    return {
      original, modified, equals: comparator?.equals ?? ( ( o, m ) => o.value === m.value ),
      ...( comparator?.key ? { key: comparator.key } : {} )
    };
  }

  public constructor ( private readonly options: EngineOptions ) {}

  public process ( input: Input ) : Result {
    const original = this.parser.parse( input.original );
    const modified = this.parser.parse( input.modified );
    const sequence = this.seq( original, modified, this.options.comparator );
    const operations = this.options.algorithm.diff( sequence );
    const script: LineScript[] = [];

    const del: { line: Line; index: number; modified: number }[] = [];
    const ins: { line: Line; index: number; original: number }[] = [];
  }
}
