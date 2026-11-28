import { Hunk } from '../core/Hunk';
import type { Result } from '../types/engine';
import type { Formatter, FormatterOptions, Granularity, InlineLine, SideBySideData, SideBySideRow } from '../types/formatter';
import type { TokenMeta } from '../types/tokenizer';
import { formatLine } from './internal/formatLine';
import { assertOption } from '../utils/assert';


export class SideBySide implements Formatter< SideBySideData > {
  public constructor ( {}: FormatterOptions ) {}

  public format ( result: Result ) : SideBySideData {
    return {} as SideBySideData;
  }
}
