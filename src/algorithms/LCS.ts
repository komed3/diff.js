import type { Algorithm } from '../types/algorithm';
import type { Operation } from '../types/operation';


export class LCS implements Algorithm {
  public diff < T > ( original: readonly T[], modified: readonly T[], equals: ( original: T, modified: T ) => boolean ) : Operation[] {
    const [ n, m ] = [ original.length, modified.length ];
    let prefix = 0, suffix = 0;

    while ( prefix < n && prefix < m && equals( original[ prefix ], modified[ prefix ] ) ) prefix++;
    while ( suffix < n - prefix && suffix < m - prefix && equals( original[ n - suffix - 1 ], modified[ m - suffix - 1 ] ) ) suffix++;

    const [ oLen, mLen ] = [ n - prefix - suffix, m - prefix - suffix ];
    const edits: ( 0 | 1 | 2 )[] = [];

    for ( let i = 0; i < suffix; i++ ) edits.push( 0 );
  }
}
