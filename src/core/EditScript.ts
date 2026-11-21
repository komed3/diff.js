import type { Operation } from '../types/operation';


export function appendOperations ( edits: ( 0 | 1 | 2 )[], operations: readonly Operation[] ) : void {
  for ( const { type, original, modified } of operations ) {
    const code = type === 'equal' ? 0 : type === 'insert' ? 1 : 2;
    const length = type === 'insert' ? modified.length : original.length;

    for ( let i = 0; i < length; i++ ) edits.push( code );
  }
}

export function createOperations ( edits: ArrayLike< number >, start = 0, end = edits.length ) : Operation[] {
  const operations: Operation[] = [];
  let [ origIdx, modIdx ] = [ 0, 0 ];

  for ( let i = start; i < end; ) {
    const code = edits[ i ], type = code === 0 ? 'equal' : code === 1 ? 'insert' : 'delete', position = i;
    while ( i < end && edits[ i ] === code ) i++;
    const length = i - position;

    operations.push( { type,
      original: { start: origIdx, length: type === 'insert' ? 0 : length },
      modified: { start: modIdx, length: type === 'delete' ? 0 : length }
    } as Operation );

    if ( type !== 'insert' ) origIdx += length;
    if ( type !== 'delete' ) modIdx += length;
  }

  return operations;
}
