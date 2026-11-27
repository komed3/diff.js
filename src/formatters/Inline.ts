import { Hunk } from '../core/Hunk';
import type { Result } from '../types/engine';
import type { Formatter, FormatterOptions, Granularity, InlineData, InlineLine, InlineToken } from '../types/formatter';
import type { TokenMeta } from '../types/tokenizer';
import { assertOption } from '../utils/assert';


export class Inline< T extends TokenMeta = {} > implements Formatter< InlineData, T > {
  private readonly hunk: Hunk;
  private readonly context: number | 'all';
  private readonly granularity: Granularity;

  private append ( tokens: InlineToken[], type: InlineToken[ 'type' ], value: string ) : void {
    if ( ! value ) return;

    const last = tokens[ tokens.length - 1 ];
    if ( last?.type === type ) tokens[ tokens.length - 1 ] = { type, value: last.value + value };
    else tokens.push( { type, value } );
  }

  public constructor ( { context = 3, granularity = 'line' }: FormatterOptions ) {
    assertOption( [ 'line', 'token' ].includes( granularity ), 'inline formatter granularity' );
    this.hunk = new Hunk( { context } ), this.context = context, this.granularity = granularity;
  }

  public format ( result: Result< T > ) : InlineData {
    const lines = this.context === 'all' ? result.script : this.hunk.create( result ).flatMap( ( { lines } ) => lines );
    const output: InlineLine[] = [];

    for ( const { original, modified, operation: { type, original: { start: os }, modified: { start: ms } }, edit } of lines ) {
      const tokens: InlineToken[] = [];

      if ( type === 'change' && this.granularity === 'token' && edit ) for ( const item of edit.operations ) {
        const side = item.type === 'insert' ? 'modified' : 'original', { start, length } = item[ side ];
        this.append( tokens, item.type, edit[ side ].slice( start, start + length ).map( ( { value } ) => value ).join( '' ) );
      } else if ( type === 'change' ) {
        this.append( tokens, 'delete', original!.value );
        this.append( tokens, 'insert', modified!.value );
      } else {
        this.append( tokens, type, ( original ?? modified )!.value );
      }

      if ( original?.ending === modified?.ending ) {
        this.append( tokens, 'equal', original?.ending ?? '' );
      } else {
        this.append( tokens, 'delete', original?.ending ?? '' );
        this.append( tokens, 'insert', modified?.ending ?? '' );
      }

      output.push( { number: ( type === 'delete' ? os : ms ) + 1, tokens } );
    }

    return { granularity: this.granularity, lines: output };
  }
}
