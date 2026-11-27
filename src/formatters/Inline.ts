import type { Result } from '../types/engine';
import type { Formatter, FormatterOptions, InlineData } from '../types/formatter';
import type { TokenMeta } from '../types/tokenizer';


export class Inline< T extends TokenMeta = {} > implements Formatter< InlineData, T > {
  public constructor ( options: FormatterOptions ) {}

  public format ( result: Result< T > ) : InlineData {
    return {} as InlineData;
  }
}
