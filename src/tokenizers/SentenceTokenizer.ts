import type { DiffToken } from '../types/token';
import type { DiffTokenizer } from '../types/tokenizer';


export class SentenceTokenizer implements DiffTokenizer {
  private readonly segmenter: Intl.Segmenter;

  constructor( locale?: string ) {
    this.segmenter = new Intl.Segmenter( locale, {
      granularity: 'sentence'
    });
  }
}
