import type { Operation } from '../types/operation';


export function appendOperations ( edits: ( 0 | 1 | 2 )[], operations: readonly Operation[] ) : void {
  for ( const { type, original, modified } of operations ) {
    const code = type === 'equal' ? 0 : type === 'insert' ? 1 : 2;
    const length = type === 'insert' ? modified.length : original.length;

    for ( let i = 0; i < length; i++ ) edits.push( code );
  }
}
