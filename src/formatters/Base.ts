import { Hunk } from '../core/Hunk';
import type { LineScript, Result } from '../types/engine';
import type { FormatSide, FormatterOptions, Granularity, InlineToken } from '../types/formatter';
import type { HunkContext, HunkData } from '../types/hunk';
import type { TokenMeta } from '../types/tokenizer';
import { assertOption } from '../utils/assert';


export class Base< T extends TokenMeta = {} > {
  protected readonly granularity: Granularity;
  private readonly hunk: Hunk;
  private readonly context: HunkContext;

  protected getHunks ( result: Result< T > ) : HunkData< T >[] {
    return this.hunk.create( result );
  }

  protected getLines ( result: Result< T > ) : LineScript< T >[] {
    return this.context === 'all' ? result.script : this.getHunks( result ).flatMap( ( { lines } ) => lines );
  }

  protected append ( tokens: InlineToken[], type: InlineToken[ 'type' ], value: string ) : void {
    if ( ! value ) return;

    const last = tokens[ tokens.length - 1 ];
    if ( last?.type === type ) tokens[ tokens.length - 1 ] = { type, value: last.value + value };
    else tokens.push( { type, value } );
  }

  protected formatLine ( { original, modified, operation: { type }, edit }: LineScript< T >, side: FormatSide = 'inline' ) : InlineToken[] {
    const tokens: InlineToken[] = [];

    if ( type === 'change' && this.granularity === 'token' && edit ) {
      for ( const { type: t, original: o, modified: m } of edit.operations ) {
        if ( side === 'original' && t === 'insert' || side === 'modified' && t === 'delete' ) continue;

        const source = t === 'insert' || t === 'equal' && side === 'modified' ? 'modified' : 'original';
        const { start, length } = source === 'modified' ? m : o;
        this.append( tokens, t, edit[ source ].slice( start, start + length ).map( token => token.value ).join( '' ) );
      }

      if ( original!.ending === modified!.ending ) this.append( tokens, 'equal', original!.ending );
      else {
        if ( side !== 'modified' ) this.append( tokens, 'delete', original!.ending );
        if ( side !== 'original' ) this.append( tokens, 'insert', modified!.ending );
      }
    } else if ( type === 'change' ) {
      if ( side !== 'modified' ) this.append( tokens, 'delete', original!.value + original!.ending );
      if ( side !== 'original' ) this.append( tokens, 'insert', modified!.value + modified!.ending );
    } else {
      const source = side === 'original' ? original : side === 'modified' ? modified : original ?? modified;
      if ( source ) this.append( tokens, type, source.value + source.ending );
    }

    return tokens;
  }

  public constructor ( { context = 3, granularity = 'line' }: FormatterOptions ) {
    assertOption( granularity === 'line' || granularity === 'token', 'formatter granularity' );
    this.hunk = new Hunk( { context } ), this.context = context, this.granularity = granularity;
  }
}
