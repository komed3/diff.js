import type { Operation } from '../types/operation';


export function populateOperations ( edits: ArrayLike< number >, start = 0, end = edits.length ) : Operation[] {
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
