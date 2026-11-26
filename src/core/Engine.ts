import type { Algorithm } from '../types/algorithm';
import type { Comparator } from '../types/comparator';
import type { EngineOptions, Input, LineScript, Result } from '../types/engine';
import type { Line } from '../types/line';
import type { Token, TokenMeta } from '../types/token';
import type { Tokenizer } from '../types/tokenizer';
import { COMPARATORS } from './Comparator';
import { LineParser } from './LineParser';


export class Engine< T extends TokenMeta = {} > {
  private readonly parser = new LineParser();
  private readonly diff: Algorithm[ 'diff' ];
  private readonly tokenize?: Tokenizer< T >[ 'tokenize' ];
  private readonly tokenDiff: Algorithm[ 'diff' ];
  private readonly comparator: Comparator< Line >;
  private readonly tokenComparator: Comparator< Token< T > >;

  public constructor ( { algorithm, comparator, tokenizer, tokenAlgorithm, tokenComparator }: EngineOptions< T > ) {
    const tokens = tokenAlgorithm ?? algorithm;
    this.diff = algorithm.diff.bind( algorithm );
    this.tokenize = tokenizer?.tokenize.bind( tokenizer );
    this.tokenDiff = tokens.diff.bind( tokens );
    this.comparator = comparator ?? COMPARATORS.exact< Line >();
    this.tokenComparator = tokenComparator ?? COMPARATORS.exact< Token< T > >();
  }

  public process ( input: Input ) : Result< T > {
    const original = this.parser.parse( input.original ), modified = this.parser.parse( input.modified );
    const operations = this.diff( { original, modified, ...this.comparator } );
    const script: LineScript< T >[] = [], ins: [ number, number ][] = [], del: [ number, number ][] = [];

    const flush = () => {
      const count = Math.min( del.length, ins.length );

      for ( let i = 0; i < count; i++ ) {
        const [ o ] = del[ i ], [ m ] = ins[ i ];
        const entry: LineScript< T > = { original: original[ o ], modified: modified[ m ], operation: {
          type: 'change', original: { start: o, length: 1 }, modified: { start: m, length: 1 }
        } };

        if ( this.tokenize ) {
          const a = this.tokenize( original[ o ].value ), b = this.tokenize( modified[ m ].value );
          entry.edit = { original: a, modified: b, operations: this.tokenDiff( {
            original: a, modified: b, ...this.tokenComparator
          } ) };
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

    for ( const { type, original: o, modified: m } of operations ) {
      if ( type === 'equal' ) {
        flush();

        for ( let i = 0; i < o.length; i++ ) {
          const oi = o.start + i, mi = m.start + i;
          script.push( { original: original[ oi ], modified: modified[ mi ], operation: {
            type: 'equal', original: { start: oi, length: 1 }, modified: { start: mi, length: 1 }
          } } );
        }
      }

      else if ( type === 'delete' ) for ( let i = 0; i < o.length; i++ ) del.push( [ o.start + i, m.start ] );
      else if ( type === 'insert' ) for ( let i = 0; i < m.length; i++ ) ins.push( [ m.start + i, o.start ] );
    }

    flush();
    return { ...input, script };
  }
}
