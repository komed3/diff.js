import type { Algorithm } from '../types/algorithm';
import type { Comparator } from '../types/context';
import type { EngineOptions, Input, LineScript, Result } from '../types/engine';
import type { Line } from '../types/line';
import type { Token } from '../types/token';
import { LineParser } from './LineParser';


export class Engine {
  private readonly parser = new LineParser();
  private readonly algorithm: Algorithm;
  private readonly tokenAlgorithm: Algorithm;
  private readonly comparator: Comparator< Line >;
  private readonly tokenComparator: Comparator< Token >;
  private readonly tokenizer: EngineOptions[ 'tokenizer' ];

  public constructor ( { algorithm, comparator, tokenizer, tokenAlgorithm, tokenComparator }: EngineOptions ) {
    this.algorithm = algorithm, this.tokenAlgorithm = tokenAlgorithm ?? algorithm;
    this.comparator = comparator ?? { equals: ( o, m ) => o.value === m.value, key: v => v.value };
    this.tokenComparator = tokenComparator ?? { equals: ( o, m ) => o.value === m.value, key: v => v.value };
    this.tokenizer = tokenizer;
  }

  public process ( input: Input ) : Result {
    const original = this.parser.parse( input.original ), modified = this.parser.parse( input.modified );
    const operations = this.algorithm.diff( { original, modified, ...this.comparator } );
    const script: LineScript[] = [], ins: [ number, number ][] = [], del: [ number, number ][] = [];

    const flush = () => {
      const count = Math.min( del.length, ins.length );

      for ( let i = 0; i < count; i++ ) {
        const [ o ] = del[ i ], [ m ] = ins[ i ];
        const entry: LineScript = { original: original[ o ], modified: modified[ m ], operation: {
          type: 'change', original: { start: o, length: 1 }, modified: { start: m, length: 1 }
        } };

        if ( this.tokenizer ) {
          const a = this.tokenizer.tokenize( original[ o ].value ), b = this.tokenizer.tokenize( modified[ m ].value );
          entry.edit = { original: a, modified: b, operations: this.tokenAlgorithm.diff( { original: a, modified: b, ...this.tokenComparator } ) };
        }

        script.push( entry );
      }

      for ( let i = count; i < del.length; i++ ) {
        const [ index, at ] = del[ i ];
        script.push( { original: original[ index ], modified: null, operation: {
          type: 'delete', original: { start: index, length: 1 }, modified: { start: at, length: 0 }
        } } );
      }

      for ( let i = count; i < ins.length; i++ ) {
        const [ index, at ] = ins[ i ];
        script.push( { original: null, modified: modified[ index ], operation: {
          type: 'insert', original: { start: at, length: 0 }, modified: { start: index, length: 1 }
        } } );
      }

      del.length = ins.length = 0;
    };

    for ( const { type, original: o, modified: m } of operations ) switch ( type ) {
      case 'equal':
        flush();

        for ( let i = 0; i < o.length; i++ ) {
          const oi = o.start + i, mi = m.start + i;
          script.push( { original: original[ oi ], modified: modified[ mi ], operation: {
            type: 'equal', original: { start: oi, length: 1 }, modified: { start: mi, length: 1 }
          } } );
        }

        break;

      case 'delete':
        for ( let i = 0; i < o.length; i++ ) del.push( [ o.start + i, m.start ] );
        break;

      case 'insert':
        for ( let i = 0; i < m.length; i++ ) ins.push( [ m.start + i, o.start ] );
        break;
    }

    flush();
    return { ...input, script };
  }
}
