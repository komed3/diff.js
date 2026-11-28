import { Hunk } from '../core/Hunk';
import type { Result } from '../types/engine';
import type { Formatter, FormatterOptions, Granularity, SideBySideData, SideBySideRow } from '../types/formatter';
import type { TokenMeta } from '../types/tokenizer';
import { assertOption } from '../utils/assert';
import { formatLine } from './internal/formatLine';


export class SideBySide< T extends TokenMeta = {} > implements Formatter< SideBySideData, T > {
  private readonly hunk: Hunk;
  private readonly context: number | 'all';
  private readonly granularity: Granularity;

  public constructor ( { context = 3, granularity = 'line' }: FormatterOptions ) {
    assertOption( [ 'line', 'token' ].includes( granularity ), 'side-by-side formatter granularity' );
    this.hunk = new Hunk( { context } ), this.context = context, this.granularity = granularity;
  }

  public format ( result: Result< T > ) : SideBySideData {
    const lines = this.context === 'all' ? result.script : this.hunk.create( result ).flatMap( ( { lines } ) => lines );
    const rows: SideBySideRow[] = [];

    for ( const line of lines ) {
      const { original, modified, operation: { original: os, modified: ms } } = line;

      rows.push( {
        original: original ? { number: os.start + 1, tokens: formatLine( line, this.granularity, 'original' ) } : null,
        modified: modified ? { number: ms.start + 1, tokens: formatLine( line, this.granularity, 'modified' ) } : null
      } );
    }

    return { granularity: this.granularity, rows };
  }
}
