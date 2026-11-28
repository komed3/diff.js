import { Hunk } from '../core/Hunk';
import type { Result } from '../types/engine';
import type { Formatter, FormatterOptions, Granularity, InlineLine, SideBySideData, SideBySideRow } from '../types/formatter';
import type { TokenMeta } from '../types/tokenizer';
import { formatLine } from './internal/formatLine';
import { assertOption } from '../utils/assert';


export class SideBySide implements Formatter< SideBySideData > {
  private readonly hunk: Hunk;
  private readonly context: number | 'all';
  private readonly granularity: Granularity;

  public constructor ( { context = 3, granularity = 'line' }: FormatterOptions ) {
    assertOption( [ 'line', 'token' ].includes( granularity ), 'side-by-side formatter granularity' );
    this.hunk = new Hunk( { context } ), this.context = context, this.granularity = granularity;
  }
}
