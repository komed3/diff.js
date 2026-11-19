import type { DiffToken } from '../types/token';
import type { DiffTokenizer } from '../types/tokenizer';


export class LineTokenizer implements DiffTokenizer {
  private readonly pattern = /\r\n|[\r\n\u2028\u2029]/gu;

  public tokenize ( text: string ) : DiffToken[] {
    const tokens: DiffToken[] = [];
    let start = 0, match: RegExpExecArray | null;

    while ( ( match = this.pattern.exec( text ) ) !== null ) {
      const end = match.index + match[ 0 ].length;
      tokens.push( { type: 'line', value: text.slice( start, end ), start, end } );
      start = end;
    }

    if ( start < text.length ) tokens.push( {
      type: 'line', value: text.slice( start ), start, end: text.length
    } );

    return tokens;
  }
}
