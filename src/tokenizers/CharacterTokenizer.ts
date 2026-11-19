import type { DiffToken } from '../types/token';
import type { DiffTokenizer } from '../types/tokenizer';


export class CharacterTokenizer implements DiffTokenizer {
  private readonly segmenter: Intl.Segmenter;

  public constructor ( locale?: string ) {
    this.segmenter = new Intl.Segmenter( locale, { granularity: 'grapheme' } );
  }

  public tokenize ( text: string ) : DiffToken[] {
    const tokens: DiffToken[] = [];

    for ( const { index, segment } of this.segmenter.segment( text ) ) tokens.push( {
      type: 'character', value: segment, start: index, end: index + segment.length
    } );

    return tokens;
  }
}
