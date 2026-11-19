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

    for ( const { index, segment, isWordLike } of this.segmenter.segment( text ) ) {
      const type = isWordLike ? 'word' : this.whitespace.test( segment ) ? 'whitespace' : 'punctuation';
      tokens.push( { type, value: segment, start: index, end: index + segment.length } );
    }

    return tokens;
  }
}
