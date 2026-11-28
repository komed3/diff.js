import { Hunk } from '../core/Hunk';
import type { LineScript, Result } from '../types/engine';
import type { FormatSide, FormatterOptions, Granularity, InlineToken } from '../types/formatter';
import type { HunkContext } from '../types/hunk';
import type { TokenMeta } from '../types/tokenizer';
import { assertOption } from '../utils/assert';


export class Base< T extends TokenMeta = {} > {
  protected readonly granularity: Granularity;
  private readonly hunk: Hunk;
  private readonly context: HunkContext;

  public constructor ( { context = 3, granularity = 'line' }: FormatterOptions ) {
    assertOption( granularity === 'line' || granularity === 'token', 'formatter granularity' );
    this.hunk = new Hunk( { context } ), this.context = context, this.granularity = granularity;
  }

  protected getLines ( result: Result< T > ) : LineScript< T >[] {
    return this.context === 'all' ? result.script : this.hunk.create( result ).flatMap( ( { lines } ) => lines );
  }

  protected append ( tokens: InlineToken[], type: InlineToken[ 'type' ], value: string ) : void {
    if ( ! value ) return;

    const last = tokens[ tokens.length - 1 ];
    if ( last?.type === type ) tokens[ tokens.length - 1 ] = { type, value: last.value + value };
    else tokens.push( { type, value } );
  }

  protected formatLine ( line: LineScript< T >, granularity: Granularity, side: FormatSide = 'inline' ) : InlineToken[] {
    const { original, modified, operation: { type }, edit } = line, tokens: InlineToken[] = [];
  
    if ( type === 'change' && granularity === 'token' && edit ) {
      for ( const { type: t, original, modified } of edit.operations ) {
        const source = t === 'insert' ? 'modified' : t === 'delete' ? 'original' : side === 'modified' ? 'modified' : 'original';
        if ( side !== 'inline' && t !== 'equal' && source !== side ) continue;

        const { start, length } = source === 'modified' ? modified : original;
        this.append( tokens, t, edit[ source ].slice( start, start + length ).map( ( { value } ) => value ).join( '' ) );
      }

      if ( original!.ending !== modified!.ending ) {
        if ( side !== 'modified' ) this.append( tokens, 'delete', original!.ending );
        if ( side !== 'original' ) this.append( tokens, 'insert', modified!.ending );
      }
    } else if ( type === 'change' ) {
      const endingsDiffer = original!.ending !== modified!.ending;

      if ( side === 'inline' ) {
        this.append( tokens, 'delete', original!.value + ( endingsDiffer ? original!.ending : '' ) );
        this.append( tokens, 'insert', modified!.value + ( endingsDiffer ? modified!.ending : '' ) );
      } else {
        const source = side === 'original' ? original! : modified!;
        this.append( tokens, side === 'original' ? 'delete' : 'insert', source.value + ( endingsDiffer ? source.ending : '' ) );
      }
    } else {
      const source = side === 'original' ? original : side === 'modified' ? modified : original ?? modified;
      if ( source ) this.append( tokens, type, source.value + source.ending );
    }

    return tokens;
  }
}
