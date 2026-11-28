import { Hunk } from '../core/Hunk';
import type { LineScript, Result } from '../types/engine';
import type { FormatSide, FormatterOptions, Granularity, InlineToken } from '../types/formatter';
import type { HunkContext } from '../types/hunk';
import type { TokenMeta } from '../types/tokenizer';
import { assertOption } from '../utils/assert';


export class BaseFormatter< T extends TokenMeta = {} > {
  protected readonly granularity: Granularity;
  private readonly hunk: Hunk;
  private readonly context: HunkContext;

  public constructor ( { context = 3, granularity = 'line' }: FormatterOptions ) {
    assertOption( granularity === 'line' || granularity === 'token', 'formatter granularity' );
    this.hunk = new Hunk( { context } ), this.context = context, this.granularity = granularity;
  }

  protected getLines < T extends TokenMeta > ( result: Result< T > ) : LineScript< T >[] {
    return this.context === 'all' ? result.script : this.hunk.create( result ).flatMap( ( { lines } ) => lines );
  }

  protected append ( tokens: InlineToken[], type: InlineToken[ 'type' ], value: string ) : void {
    if ( ! value ) return;
  
    const last = tokens[ tokens.length - 1 ];
    if ( last?.type === type ) tokens[ tokens.length - 1 ] = { type, value: last.value + value };
    else tokens.push( { type, value } );
  }
}
