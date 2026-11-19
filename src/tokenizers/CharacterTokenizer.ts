import type { DiffToken } from '../types/token';
import type { DiffTokenizer } from '../types/tokenizer';


export class CharacterTokenizer implements DiffTokenizer {
  private readonly segmenter: Intl.Segmenter;

  public constructor ( locale?: string ) {
    this.segmenter = new Intl.Segmenter( locale, { granularity: 'grapheme' } );
  }
}
