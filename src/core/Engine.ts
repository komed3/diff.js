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
    const original = this.parser.parse( input.original );
    const modified = this.parser.parse( input.modified );
    const operations = this.algorithm.diff( { original, modified, ...this.comparator } );
    const script: LineScript[] = [];
    const deleted: number[] = [], deletedAt: number[] = [];
    const inserted: number[] = [], insertedAt: number[] = [];

    const flush = () => {
      const count = Math.min( deleted.length, inserted.length );

      for ( let i = 0; i < count; i++ ) {
        const o = deleted[ i ], m = inserted[ i ];
        const entry: LineScript = {
          original: original[ o ], modified: modified[ m ],
          operation: {
            type: 'change',
            original: { start: o, length: 1 },
            modified: { start: m, length: 1 }
          }
        };

        if ( this.tokenizer ) {
          const a = this.tokenizer.tokenize( original[ o ].value );
          const b = this.tokenizer.tokenize( modified[ m ].value );
          entry.edit = {
            original: a, modified: b,
            operations: this.tokenAlgorithm.diff( { original: a, modified: b, ...this.tokenComparator } )
          };
        }

        script.push( entry );
      }

      for ( let i = count; i < deleted.length; i++ ) {
        const index = deleted[ i ];
        script.push( {
          original: original[ index ], modified: null,
          operation: {
            type: 'delete',
            original: { start: index, length: 1 },
            modified: { start: deletedAt[ i ], length: 0 }
          }
        } );
      }

      for ( let i = count; i < inserted.length; i++ ) {
        const index = inserted[ i ];
        script.push( {
          original: null, modified: modified[ index ],
          operation: {
            type: 'insert',
            original: { start: insertedAt[ i ], length: 0 },
            modified: { start: index, length: 1 }
          }
        } );
      }

      deleted.length = deletedAt.length = inserted.length = insertedAt.length = 0;
    };

    for ( const operation of operations ) {
      switch ( operation.type ) {
        case 'equal':
          flush();

          for ( let i = 0; i < operation.original.length; i++ ) {
            const o = operation.original.start + i, m = operation.modified.start + i;
            script.push( {
              original: original[ o ], modified: modified[ m ],
              operation: {
                type: 'equal',
                original: { start: o, length: 1 },
                modified: { start: m, length: 1 }
              }
            } );
          }
          break;

        case 'delete':
          for ( let i = 0; i < operation.original.length; i++ ) {
            deleted.push( operation.original.start + i );
            deletedAt.push( operation.modified.start );
          }
          break;

        case 'insert':
          for ( let i = 0; i < operation.modified.length; i++ ) {
            inserted.push( operation.modified.start + i );
            insertedAt.push( operation.original.start );
          }
          break;
      }
    }

    flush();
    return { ...input, script };
  }
}
