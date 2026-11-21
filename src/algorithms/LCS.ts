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

    if ( oLen && mLen ) {
      const dirs = new Uint8Array( oLen * mLen );
      let previous = new Uint32Array( mLen + 1 ), current = new Uint32Array( mLen + 1 );

      for ( let i = 1; i <= oLen; i++ ) {
        for ( let j = 1; j <= mLen; j++ ) {
          const index = ( i - 1 ) * mLen + j - 1;

          if ( equals( original[ prefix + i - 1 ], modified[ prefix + j - 1 ] ) ) current[ j ] = previous[ j - 1 ] + 1, dirs[ index ] = 1;
          else if ( previous[ j ] >= current[ j - 1 ] ) current[ j ] = previous[ j ], dirs[ index ] = 2;
          else current[ j ] = current[ j - 1 ], dirs[ index ] = 3;
        }

        [ previous, current ] = [ current, previous ];
      }

      let [ i, j ] = [ oLen, mLen ];

      while ( i && j ) {
        const direction = dirs[ ( i - 1 ) * mLen + j - 1 ];

        if ( direction === 1 ) edits.push( 0 ), i--, j--;
        else if ( direction === 2 ) edits.push( 2 ), i--;
        else edits.push( 1 ), j--;
      }

      while ( i-- ) edits.push( 2 );
      while ( j-- ) edits.push( 1 );
    } else {
      for ( let i = 0; i < oLen; i++ ) edits.push( 2 );
      for ( let i = 0; i < mLen; i++ ) edits.push( 1 );
    }
  }
}
