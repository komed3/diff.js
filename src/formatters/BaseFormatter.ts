import { Hunk } from '../core/Hunk';
import type { Result, LineScript } from '../types/engine';
import type { FormatterOptions, Granularity } from '../types/formatter';
import type { TokenMeta } from '../types/tokenizer';
import { assertOption } from '../utils/assert';


export class BaseFormatter {
  protected readonly granularity: Granularity;
  private readonly hunk: Hunk;
  private readonly context: number | 'all';

  public constructor ( { context = 3, granularity = 'line' }: FormatterOptions ) {
    assertOption( granularity === 'line' || granularity === 'token', 'formatter granularity' );
    this.hunk = new Hunk( { context } ), this.context = context, this.granularity = granularity;
  }

  protected getLines < T extends TokenMeta > ( result: Result< T > ) : LineScript< T >[] {
    return this.context === 'all' ? result.script : this.hunk.create( result ).flatMap( ( { lines } ) => lines );
  }
}
