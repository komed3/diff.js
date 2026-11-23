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

    const flush = () => {
      const count = Math.min( del.length, ins.length );

      for ( let i = 0; i < count; i++ ) {
        const o = del[ i ], m = ins[ i ], entry: LineScript = {
          original: o.line, modified: m.line, operation: {
            type: 'change',
            original: { start: o.index, length: 1 },
            modified: { start: m.index, length: 1 }
          }
        };

        if ( this.options.tokenizer ) {
          const tokensOriginal = this.options.tokenizer.tokenize( o.line.value );
          const tokensModified = this.options.tokenizer.tokenize( m.line.value );
          const tokenSequence = this.seq( tokensOriginal, tokensModified, this.options.tokenComparator );

          entry.edit = {
            original: tokensOriginal, modified: tokensModified,
            operations: ( this.options.tokenAlgorithm ?? this.options.algorithm ).diff( tokenSequence )
          };
        }

        script.push( entry );
      }

      for ( let i = count; i < del.length; i++ ) {
        const item = del[ i ];

        script.push( { original: item.line, modified: null, operation: {
          type: 'delete',
          original: { start: item.index, length: 1 },
          modified: { start: item.modified, length: 0 }
        } } );
      }

      for ( let i = count; i < ins.length; i++ ) {
        const item = ins[ i ];

        script.push( { original: null, modified: item.line, operation: {
          type: 'insert',
          original: { start: item.original, length: 0 },
          modified: { start: item.index, length: 1 }
        } } );
      }

      del.length = 0, ins.length = 0;
    };
  }
}
