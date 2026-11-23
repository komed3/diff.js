import type { Token } from '../types/token';
import type { Tokenizer, TokenizerOptions } from '../types/tokenizer';


export class Character implements Tokenizer {
  private readonly segmenter: Intl.Segmenter;

  public constructor ( { locale }: TokenizerOptions ) {
    this.segmenter = new Intl.Segmenter( locale, { granularity: 'grapheme' } );
  }
}
