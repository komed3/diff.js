import type { DiffAlgorithm } from '../types/algorithm';
import type { EditStep, Operation } from '../types/operation';


export class MyersAlgorithm implements DiffAlgorithm {
  public diff < T > (
    original: readonly T[], modified: readonly T[],
    equals: ( original: T, modified: T ) => boolean
  ) : Operation[] {
    const n = original.length, m = modified.length;
    let prefix = 0, suffix = 0;

    while (
      prefix < n && prefix < m &&
      equals( original[ prefix ], modified[ prefix ] )
    ) prefix++;

    while (
      suffix < n - prefix && suffix < m - prefix &&
      equals( original[ n - suffix - 1 ], modified[ m - suffix - 1 ] )
    ) suffix++;

    const steps: EditStep[] = [];
    for ( let i = suffix - 1; i >= 0; i-- ) steps.push( {
      type: 'equal', original: n - i - 1, modified: m - i - 1
    } );

    const oLength = n - prefix - suffix, mLength = m - prefix - suffix;
    const max = oLength + mLength;

    if ( max > 0 ) {
      const vector = new Int32Array( max * 2 + 3 ), trace: Int32Array[] = [], offset = max + 1;
      let dist = 0, found = false;

      for ( let d = 0; d <= max; d++ ) {
        for ( let k = -d; k <= d; k += 2 ) {
          const i = offset + k;

          let x = k === -d || ( k !== d && vector[ i - 1 ] < vector[ i + 1 ] )
            ? vector[ i + 1 ] : vector[ i - 1 ] + 1, y = x - k;

          while (
            x < oLength && y < mLength &&
            equals( original[ prefix + x ], modified[ prefix + y ] )
          ) x++, y++;

          vector[ i ] = x;

          if ( x >= oLength && y >= mLength ) {
            dist = d, found = true;
            break;
          }
        }

        trace.push( vector.slice() );
        if ( found ) break;
      }

      let x = oLength, y = mLength;

      for ( let d = dist; d > 0; d-- ) {
        const prev = trace[ d - 1 ], k = x - y;

        const prevK = k === -d || ( k !== d && prev[ offset + k - 1 ] < prev[ offset + k + 1 ] )
          ? k + 1 : k - 1;

        const prevX = prev[ offset + prevK ];
        const prevY = prevX - prevK;

        while ( x > prevX && y > prevY ) {
          x--, y--;

          steps.push( { type: 'equal', original: prefix + x, modified: prefix + y } );
        }

        if ( x === prevX ) {
          y--;

          steps.push( { type: 'insert', original: prefix + x, modified: prefix + y } );
        } else {
          x--;

          steps.push( {
            type: 'delete', original: prefix + x, modified: prefix + y } );
        }

        x = prevX, y = prevY;
      }

      while ( x > 0 && y > 0 ) {
        x--, y--;

        steps.push( { type: 'equal', original: prefix + x, modified: prefix + y } );
      }
    }

    for ( let i = prefix - 1; i >= 0; i-- ) steps.push( { type: 'equal', original: i, modified: i } );
  }
}
