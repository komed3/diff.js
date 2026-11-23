import type { Token } from '../types/token';
import type { Tokenizer, TokenizerOptions } from '../types/tokenizer';


export class Word implements Tokenizer {
  private readonly segmenter: Intl.Segmenter;
  private readonly whitespace = /^\s+$/u;

  public constructor ( { locale }: TokenizerOptions ) {
    this.segmenter = new Intl.Segmenter( locale, { granularity: 'word' } );
  }
}
