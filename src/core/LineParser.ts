import type { Line } from '../types/line';


export class LineParser {
  public parse ( text: string ) : Line[] {
    const lines: Line[] = [];
    let start = 0;

    const addLine = ( contentEnd: number, ending: string ) => {
      const end = contentEnd + ending.length;
      lines.push( { value: text.slice( start, contentEnd ), ending, start, contentEnd, end } );
      start = end;
    };

    for ( let i = 0; i < text.length; i++ ) {
      const code = text.charCodeAt( i );

      const ending = code === 13 ? ( text.charCodeAt( i + 1 ) === 10 ? '\r\n' : '\r' )
        : code === 10 ? '\n' : code === 0x2028 ? '\u2028' : code === 0x2029 ? '\u2029' : '';

      if ( ending ) addLine( i, ending );
      if ( ending === '\r\n' ) i++;
    }

    if ( start < text.length ) addLine( text.length, '' );
    return lines;
  }
}
