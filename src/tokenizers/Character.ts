import type { Token } from '../types/token';
import type { Tokenizer, TokenizerOptions } from '../types/tokenizer';
import { createGraphemeSegmenter } from '../utils/grapheme';


export class Character implements Tokenizer {
  private readonly segmenter: Intl.Segmenter;

  public constructor ( { locale }: TokenizerOptions = {} ) {
    this.segmenter = createGraphemeSegmenter( locale );
  }

  public tokenize ( text: string ) : Token[] {
    const tokens: Token[] = [];

    for ( const { index, segment } of this.segmenter.segment( text ) ) tokens.push( {
      type: 'character', value: segment, start: index, end: index + segment.length
    } );

    return tokens;
  }
}
