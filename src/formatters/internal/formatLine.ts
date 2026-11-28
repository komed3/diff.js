import type { LineScript } from '../../types/engine';
import type { Granularity, InlineToken } from '../../types/formatter';
import type { TokenMeta } from '../../types/tokenizer';


function append ( tokens: InlineToken[], type: InlineToken[ 'type' ], value: string ) : void {
  if ( ! value ) return;

  const last = tokens[ tokens.length - 1 ];
  if ( last?.type === type ) tokens[ tokens.length - 1 ] = { type, value: last.value + value };
  else tokens.push( { type, value } );
}
