import type { Token, Tokenizer, TokenizerOptions } from '../types/tokenizer';


export class Word implements Tokenizer {
  private readonly segmenter: Intl.Segmenter;
  private readonly whitespace = /^\s+$/u;

  public constructor ( { locale }: TokenizerOptions = {} ) {
    this.segmenter = new Intl.Segmenter( locale, { granularity: 'word' } );
  }

  public tokenize ( text: string ) : Token[] {
    const tokens: Token[] = [];

    for ( const { index, segment, isWordLike } of this.segmenter.segment( text ) ) {
      const value = segment, type = isWordLike ? 'word' : this.whitespace.test( value )
        ? 'whitespace' : 'punctuation';

      tokens.push( { type, value, start: index, end: index + value.length } );
    }

    return tokens;
  }
}
