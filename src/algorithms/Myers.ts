import type { Algorithm, MyersOptions } from '../types/algorithm';
import type { EditStep, Operation } from '../types/operation';


export class Myers implements Algorithm {
  private readonly mode: 'fast' | 'minimal';

  public constructor ( options: MyersOptions = {} ) {
    this.mode = options.mode ?? 'fast';
  }

  public diff < T > ( original: readonly T[], modified: readonly T[], equals: ( original: T, modified: T ) => boolean ) : Operation[] {
    const [ n, m ] = [ original.length, modified.length ];
    let prefix = 0, suffix = 0;

    while ( prefix < n && prefix < m && equals( original[ prefix ], modified[ prefix ] ) ) prefix++;
    while ( suffix < n - prefix && suffix < m - prefix && equals( original[ n - suffix - 1 ], modified[ m - suffix - 1 ] ) ) suffix++;

    const edits: EditStep[ 'type' ][] = [];
    for ( let i = 0; i < suffix; i++ ) edits.push( 'equal' );

    const [ oLen, mLen ] = [ n - prefix - suffix, m - prefix - suffix ], maxDist = oLen + mLen;
    const limit = this.mode === 'fast' ? Math.min( maxDist, 1024, Math.max( 64, Math.ceil( Math.sqrt( maxDist ) * 2 ) ) ) : maxDist;

    if ( maxDist ) {
      const frontier = new Int32Array( limit * 2 + 3 ), trace: Int32Array[] = [], offset = maxDist + 1;
      frontier[ offset + 1 ] = 0;

      let dist = 0, finished = false;

      for ( ; dist <= limit; dist++ ) {
        for ( let diag = -dist; diag <= dist; diag += 2 ) {
          const index = offset + diag;

          let x = diag === -dist || ( diag !== dist && frontier[ index - 1 ] < frontier[ index + 1 ] )
            ? frontier[ index + 1 ] : frontier[ index - 1 ] + 1, y = x - diag;

          while ( x < oLen && y < mLen && equals( original[ prefix + x ], modified[ prefix + y ] ) ) x++, y++;
          frontier[ index ] = x;

          if ( x >= oLen && y >= mLen ) { finished = true; break }
        }

        const layer = new Int32Array( dist + 1 );
        for ( let diag = -dist, i = 0; diag <= dist; diag += 2, i++ ) layer[ i ] = frontier[ offset + diag ];
        trace.push( layer );

        if ( finished ) break;
      }

      if ( finished ) {
        let [ x, y ] = [ oLen, mLen ];

        for ( let d = dist; d > 0; d-- ) {
          const prev = trace[ d - 1 ], diag = x - y, prevDiag = diag === -d ||
            ( diag !== d && prev[ ( diag + d - 2 ) / 2 ] < prev[ ( diag + d ) / 2 ] )
            ? diag + 1 : diag - 1;

          const prevX = prev[ ( prevDiag + d - 1 ) / 2 ], prevY = prevX - prevDiag;
          while ( x > prevX && y > prevY ) edits.push( 'equal' ), x--, y--;

          edits.push( x === prevX ? 'insert' : 'delete' );
          x === prevX ? y-- : x--;
          [ x, y ] = [ prevX, prevY ];
        }

        while ( x > 0 && y > 0 ) edits.push( 'equal' ), x--, y--;
        while ( x-- ) edits.push( 'delete' );
        while ( y-- ) edits.push( 'insert' );
      } else {
        for ( let i = 0; i < mLen; i++ ) edits.push( 'insert' );
        for ( let i = 0; i < oLen; i++ ) edits.push( 'delete' );
      }
    }

    for ( let i = 0; i < prefix; i++ ) edits.push( 'equal' );

    edits.reverse();

    const operations: Operation[] = [];
    let [ origIdx, modIdx ] = [ 0, 0 ];

    for ( let i = 0; i < edits.length; ) {
      const type = edits[ i ], start = i;
      while ( i < edits.length && edits[ i ] === type ) i++;
      const length = i - start;

      operations.push( {
        type,
        original: { start: origIdx, length: type === 'insert' ? 0 : length },
        modified: { start: modIdx, length: type === 'delete' ? 0 : length }
      } as Operation );

      if ( type !== 'insert' ) origIdx += length;
      if ( type !== 'delete' ) modIdx += length;
    }

    return operations;
  }
}
