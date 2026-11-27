import type { Result } from '../types/engine';
import type { Formatter, FormatterOptions, UnifiedData } from '../types/formatter';


export class Unified implements Formatter< UnifiedData > {
  public constructor ( {}: FormatterOptions ) {}

  public format ( result: Result ) : UnifiedData {
    return {} as UnifiedData;
  }
}
