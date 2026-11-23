import type { Token } from '../types/token';
import type { Tokenizer } from '../types/tokenizer';


export class Word implements Tokenizer {
  private readonly segmenter: Intl.Segmenter;
  private readonly whitespace = /^\s+$/u;

  public constructor ( locale?: string ) {
    this.segmenter = new Intl.Segmenter( locale, { granularity: 'word' } );
  }
}
