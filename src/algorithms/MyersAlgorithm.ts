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

    for ( let i = 0; i < suffix; i++ ) steps.push( {
      type: 'equal', original: n - i - 1, modified: m - i - 1
    } );

    const oLength = n - prefix - suffix, mLength = m - prefix - suffix;
    const max = oLength + mLength;

    if ( max ) {
      const vector = new Int32Array( max * 2 + 3 ), trace: Int32Array[] = [];
      const offset = max + 1;
      let dist = 0, found = false;

      for ( let d = 0; d <= max; d++ ) {
        for ( let k = -d; k <= d; k += 2 ) {
          const i = offset + k;
          let x = k === -d || ( k !== d && vector[ i - 1 ] < vector[ i + 1 ] )
            ? vector[ i + 1 ] : vector[ i - 1 ] + 1;
          let y = x - k;

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

        const layer = new Int32Array( d + 1 );

        for ( let k = -d, j = 0; k <= d; k += 2, j++ )
          layer[ j ] = vector[ offset + k ];

        trace.push( layer );
        if ( found ) break;
      }

      let x = oLength, y = mLength;

      for ( let d = dist; d > 0; d-- ) {
        const prev = trace[ d - 1 ], k = x - y;
        const prevK = k === -d || (
          k !== d && prev[ ( k - 1 + d - 1 ) / 2 ] < prev[ ( k + 1 + d - 1 ) / 2 ]
        ) ? k + 1 : k - 1;

        const prevX = prev[ ( prevK + d - 1 ) / 2 ], prevY = prevX - prevK;

        while ( x > prevX && y > prevY ) {
          x--, y--;

          steps.push( { type: 'equal', original: prefix + x, modified: prefix + y } );
        }

        if ( x === prevX ) {
          y--;

          steps.push( { type: 'insert', original: prefix + x, modified: prefix + y } );
        } else {
          x--;

          steps.push( { type: 'delete', original: prefix + x, modified: prefix + y } );
        }

        x = prevX, y = prevY;
      }

      while ( x > 0 && y > 0 ) {
        x--, y--;

        steps.push( { type: 'equal', original: prefix + x, modified: prefix + y } );
      }
    }

    for ( let i = prefix - 1; i >= 0; i-- )
      steps.push( { type: 'equal', original: i, modified: i } );

    steps.reverse();

    const operations: Operation[] = [];
    let oStart = 0, mStart = 0, oCount = 0, mCount = 0;
    let oPos = 0, mPos = 0;
    let type: EditStep[ 'type' ] | null = null;

    const flush = () => {
      if ( ! type ) return;

      if ( type === 'equal' ) operations.push( {
        type,
        original: { start: oStart, length: oCount },
        modified: { start: mStart, length: mCount }
      } );
      else if ( type === 'insert' ) operations.push( {
        type,
        original: { start: oStart, length: 0 },
        modified: { start: mStart, length: mCount }
      } );
      else operations.push( {
        type,
        original: { start: oStart, length: oCount },
        modified: { start: mStart, length: 0 }
      } );

      type = null, oCount = 0, mCount = 0;
    };

    for ( const step of steps ) {
      if ( type !== step.type ) {
        flush();

        type = step.type;
        oStart = oPos;
        mStart = mPos;
      }

      if ( step.type !== 'insert' ) oCount++, oPos++;
      if ( step.type !== 'delete' ) mCount++, mPos++;
    }

    flush();
    return operations;
  }
}
