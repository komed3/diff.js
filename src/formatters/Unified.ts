import type { Result } from '../types/engine';
import type { Formatter, UnifiedData } from '../types/formatter';
import type { TokenMeta } from '../types/tokenizer';
import { Base } from './Base';


export class Unified< T extends TokenMeta = {} > extends Base< T > implements Formatter< UnifiedData, T > {
  public format ( result: Result< T > ) : UnifiedData {
    return {} as UnifiedData;
  }
}
