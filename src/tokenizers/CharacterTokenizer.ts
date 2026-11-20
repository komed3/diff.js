import type { Token } from '../types/token';
import type { Tokenizer } from '../types/tokenizer';


export class CharacterTokenizer implements Tokenizer {
  private readonly segmenter: Intl.Segmenter;

  public constructor ( locale?: string ) {
    this.segmenter = new Intl.Segmenter( locale, { granularity: 'grapheme' } );
  }

  public tokenize ( text: string ) : Token[] {
    const tokens: Token[] = [];

    for ( const { index, segment } of this.segmenter.segment( text ) ) tokens.push( {
      type: 'character', value: segment, start: index, end: index + segment.length
    } );

    return tokens;
  }
}
