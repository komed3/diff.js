import type { Comparable, Context, Sequence } from '../../types/context';
import { commonEdges } from './commonEdges';
import { populateOperations } from './populateOperations';


export function createContext < T extends Comparable > ( seq: Sequence< T > ) : Context < T > {
  const n = seq.original.length, m = seq.modified.length;
  const { prefix, suffix } = commonEdges( seq, { oStart: 0, oEnd: n, mStart: 0, mEnd: m } );
  const editCount = n + m - prefix - suffix + 1, editCodes = new Int8Array( editCount );

  let editStart = editCount;

  const pushEdit = ( type: 0 | 1 | 2 ) => editCodes[ --editStart ] = type;
  for ( let i = 0; i < suffix; i++ ) pushEdit( 0 );

  const finish = () => {
    for ( let i = 0; i < prefix; i++ ) pushEdit( 0 );
    return populateOperations( editCodes, editStart, editCount );
  };

  return {
    bounds: { oStart: prefix, oEnd: n - suffix, mStart: prefix, mEnd: m - suffix },
    seq, pushEdit, finish
  };
}
