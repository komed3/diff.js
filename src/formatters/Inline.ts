import type { Result } from '../types/engine';
import type { Formatter, InlineData, InlineLine } from '../types/formatter';
import type { TokenMeta } from '../types/tokenizer';
import { BaseFormatter } from './BaseFormatter';


export class Inline< T extends TokenMeta = {} > extends BaseFormatter< T > implements Formatter< InlineData, T > {
  public format ( result: Result< T > ) : InlineData {
    const lines = this.getLines( result ), output: InlineLine[] = [];

    for ( const line of lines ) output.push( {
      number: ( line.operation.type === 'delete' ? line.operation.original.start : line.operation.modified.start ) + 1,
      tokens: this.formatLine( line, this.granularity )
    } );

    return { granularity: this.granularity, lines: output };
  }
}
