import { Hunk } from '../core/Hunk';
import type { Result } from '../types/engine';
import type { Formatter, FormatterOptions, Granularity, InlineData, InlineLine } from '../types/formatter';
import type { TokenMeta } from '../types/tokenizer';
import { assertOption } from '../utils/assert';
import { formatLine } from './internal/formatLine';


export class Inline< T extends TokenMeta = {} > implements Formatter< InlineData, T > {
  private readonly hunk: Hunk;
  private readonly context: number | 'all';
  private readonly granularity: Granularity;

  public constructor ( { context = 3, granularity = 'line' }: FormatterOptions ) {
    assertOption( [ 'line', 'token' ].includes( granularity ), 'inline formatter granularity' );
    this.hunk = new Hunk( { context } ), this.context = context, this.granularity = granularity;
  }

  public format ( result: Result< T > ) : InlineData {
    const lines = this.context === 'all' ? result.script : this.hunk.create( result ).flatMap( ( { lines } ) => lines );
    const output: InlineLine[] = [];

    for ( const line of lines ) {
      const { type, original, modified } = line.operation;

      output.push( {
        number: ( type === 'delete' ? original.start : modified.start ) + 1,
        tokens: formatLine( line, this.granularity )
      } );
    }

    return { granularity: this.granularity, lines: output };
  }
}
