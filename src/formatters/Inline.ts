import type { Result } from '../types/engine';
import type { Formatter, FormatterOptions, InlineData } from '../types/formatter';


export class Inline implements Formatter< InlineData > {
  public constructor ( {}: FormatterOptions ) {}

  public format ( result: Result ) : InlineData {
    return {} as InlineData;
  }
}
