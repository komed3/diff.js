import type { Result } from '../types/engine';
import type { Formatter, SideBySideData, SideBySideRow } from '../types/formatter';
import type { TokenMeta } from '../types/tokenizer';
import { BaseFormatter } from './BaseFormatter';


export class SideBySide< T extends TokenMeta = {} > extends BaseFormatter implements Formatter< SideBySideData, T > {
  public format ( result: Result< T > ) : SideBySideData {
    const lines = this.getLines( result ), rows: SideBySideRow[] = [];

    for ( const line of lines ) {
      const { original, modified, operation: { original: os, modified: ms } } = line;

      rows.push( {
        original: original ? { number: os.start + 1, tokens: this.formatLine( line, this.granularity, 'original' ) } : null,
        modified: modified ? { number: ms.start + 1, tokens: this.formatLine( line, this.granularity, 'modified' ) } : null
      } );
    }

    return { granularity: this.granularity, rows };
  }
}
