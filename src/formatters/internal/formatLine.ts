import type { LineScript } from '../../types/engine';
import type { FormatSide, Granularity, InlineToken } from '../../types/formatter';
import type { TokenMeta } from '../../types/tokenizer';


function append ( tokens: InlineToken[], type: InlineToken[ 'type' ], value: string ) : void {
  if ( ! value ) return;

  const last = tokens[ tokens.length - 1 ];
  if ( last?.type === type ) tokens[ tokens.length - 1 ] = { type, value: last.value + value };
  else tokens.push( { type, value } );
}


export function formatLine < T extends TokenMeta = {} > (
  line: LineScript< T >, granularity: Granularity, side: FormatSide = 'inline'
) : InlineToken[] {
  const { original, modified, operation: { type }, edit } = line, tokens: InlineToken[] = [];

  if ( type === 'change' && granularity === 'token' && edit ) {
    for ( const item of edit.operations ) {
      const source = item.type === 'insert' ? 'modified'
        : item.type === 'delete' ? 'original' : side === 'modified' ? 'modified' : 'original';

      if ( side !== 'inline' && item.type !== 'equal' && source !== side ) continue;

      const { start, length } = item[ source ];
      append( tokens, item.type, edit[ source ].slice( start, start + length ).map( ( { value } ) => value ).join( '' ) );
    }

    if ( original!.ending !== modified!.ending ) {
      if ( side !== 'modified' ) append( tokens, 'delete', original!.ending );
      if ( side !== 'original' ) append( tokens, 'insert', modified!.ending );
    }
  } else if ( type === 'change' ) {
    const endingsDiffer = original!.ending !== modified!.ending;

    if ( side === 'inline' ) {
      append( tokens, 'delete', original!.value + ( endingsDiffer ? original!.ending : '' ) );
      append( tokens, 'insert', modified!.value + ( endingsDiffer ? modified!.ending : '' ) );
    } else {
      const source = side === 'original' ? original! : modified!;
      append( tokens, side === 'original' ? 'delete' : 'insert', source.value + ( endingsDiffer ? source.ending : '' ) );
    }
  } else {
    const source = side === 'original' ? original : side === 'modified' ? modified : original ?? modified;
    if ( source ) append( tokens, type, source.value + source.ending );
  }

  return tokens;
}
