import type { Context } from '../../types/context';
import type { Operation } from '../../types/operation';
import { commonEdges } from './commonEdges';
import { populateOperations } from './populateOperations';


export function createContext < T > ( original: readonly T[], modified: readonly T[], equals: ( o: T, m: T ) => boolean ) : Context {
  const n = original.length, m = modified.length;
  const { prefix, suffix } = commonEdges( original, modified, equals );
  const editCount = n + m - prefix - suffix + 1, editCodes = new Int8Array( editCount );

  let editStart = editCount;

  const pushEdit = ( type: 0 | 1 | 2 ) => editCodes[ --editStart ] = type;
  for ( let i = 0; i < suffix; i++ ) pushEdit( 0 );

  return {
    prefix, suffix, oStart: prefix, oEnd: n - suffix, mStart: prefix, mEnd: m - suffix,
    oLen: n - prefix - suffix, mLen: m - prefix - suffix, pushEdit, finish () : Operation[] {
      for ( let i = 0; i < prefix; i++ ) pushEdit( 0 );
      return populateOperations( editCodes, editStart, editCount );
    }
  };
}
