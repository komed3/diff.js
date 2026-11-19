import type { DiffToken } from '../types/token';
import type { DiffTokenizer } from '../types/tokenizer';


export class SentenceTokenizer implements DiffTokenizer {
  private readonly segmenter: Intl.Segmenter;

  public constructor ( locale?: string ) {
    this.segmenter = new Intl.Segmenter( locale, { granularity: 'sentence' } );
  }

  public tokenize ( text: string ) : DiffToken[] {
    const tokens: DiffToken[] = [];

    for ( const segment of this.segmenter.segment( text ) ) tokens.push( {
      type: 'sentence', value: segment.segment, start: segment.index,
      end: segment.index + segment.segment.length
    } );

    return tokens;
  }
}
