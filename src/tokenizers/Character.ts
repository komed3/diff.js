import type { Token } from '../types/token';
import type { Tokenizer, TokenizerOptions } from '../types/tokenizer';
import { assertOption } from '../utils/assert';
import { graphemeSegmenter } from '../utils/grapheme';


export class Character implements Tokenizer {
  private readonly locale?: string;

  public constructor ( { locale }: TokenizerOptions = {} ) {
    assertOption( ! locale || typeof locale === 'string', 'similarity locale' );
    this.locale = locale;
  }

  public tokenize ( text: string ) : Token[] {
    const tokens: Token[] = [];

    for ( const { index, segment } of graphemeSegmenter( this.locale ).segment( text ) ) tokens.push( {
      type: 'character', value: segment, start: index, end: index + segment.length
    } );

    return tokens;
  }
}
