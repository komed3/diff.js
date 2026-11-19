import type { DiffToken } from '../types/token';
import type { DiffTokenizer } from '../types/tokenizer';


export class WordTokenizer implements DiffTokenizer {
  private readonly segmenter: Intl.Segmenter;
  private readonly whitespace = /^\s+$/u;

  public constructor ( locale?: string ) {
    this.segmenter = new Intl.Segmenter( locale, { granularity: 'word' } );
  }

  public tokenize ( text: string ) : DiffToken[] {
    const tokens: DiffToken[] = [];

    for ( const segment of this.segmenter.segment( text ) ) {
      const value = segment.segment, type = segment.isWordLike
        ? 'word' : this.whitespace.test( value )
          ? 'whitespace' : 'punctuation';

      tokens.push( { type, value, start: segment.index, end: segment.index + value.length } );
    }

    return tokens;
  }
}
