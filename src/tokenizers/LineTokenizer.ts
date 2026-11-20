import type { Token } from '../types/token';
import type { Tokenizer } from '../types/tokenizer';


export class LineTokenizer implements Tokenizer {
  private readonly pattern = /\r\n|[\r\n\u2028\u2029]/gu;

  public tokenize ( text: string ) : Token[] {
    const tokens: Token[] = [];
    let start = 0, match: RegExpExecArray | null;

    const add = ( end: number ) => {
      tokens.push( { type: 'line', value: text.slice( start, end ), start, end } );
      start = end;
    }

    while ( ( match = this.pattern.exec( text ) ) !== null ) add( match.index + match[ 0 ].length );
    if ( start < text.length ) add( text.length );

    return tokens;
  }
}
