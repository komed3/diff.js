import type { Token } from '../types/token';
import type { Tokenizer } from '../types/tokenizer';


export class WordTokenizer implements Tokenizer {
  private readonly segmenter: Intl.Segmenter;
  private readonly whitespace = /^\s+$/u;

  public constructor ( locale?: string ) {
    this.segmenter = new Intl.Segmenter( locale, { granularity: 'word' } );
  }

  public tokenize ( text: string ) : Token[] {
    const tokens: Token[] = [];

    for ( const { index, segment, isWordLike } of this.segmenter.segment( text ) ) {
      const type = isWordLike ? 'word' : this.whitespace.test( segment ) ? 'whitespace' : 'punctuation';
      tokens.push( { type, value: segment, start: index, end: index + segment.length } );
    }

    return tokens;
  }
}
