import type { Result } from '../types/engine';
import type { Formatter, FormatterOptions, SideBySideData } from '../types/formatter';


export class SideBySide implements Formatter< SideBySideData > {
  public constructor ( {}: FormatterOptions ) {}

  public format ( result: Result ) : SideBySideData {
    return {} as SideBySideData;
  }
}
