export function myersDiffRange < T > (
  original: readonly T[], modified: readonly T[], equals: ( o: T, m: T ) => boolean,
  oStart: number, oEnd: number, mStart: number, mEnd: number,
  pushEdit: ( type: 0 | 1 | 2 ) => void
) : void {
  const oLen = oEnd - oStart, mLen = mEnd - mStart, maxDist = oLen + mLen;

  if ( ! maxDist ) return;

  const frontier = new Int32Array( maxDist * 2 + 3 ), offset = maxDist + 1;
  frontier[ offset + 1 ] = 0;

  let trace = new Int32Array( 64 ), dist = 0, finished = false;

  for ( ; dist <= maxDist; dist++ ) {
    for ( let diag = -dist; diag <= dist; diag += 2 ) {
      const index = offset + diag;

      let x = diag === -dist || ( diag !== dist && frontier[ index - 1 ] < frontier[ index + 1 ] )
        ? frontier[ index + 1 ] : frontier[ index - 1 ] + 1, y = x - diag;

      while ( x < oLen && y < mLen && equals( original[ oStart + x ], modified[ mStart + y ] ) ) x++, y++;
      frontier[ index ] = x;

      if ( x >= oLen && y >= mLen ) { finished = true; break }
    }

    const traceOff = dist * ( dist + 1 ) / 2, traceLen = traceOff + dist + 1;

    if ( traceLen > trace.length ) {
      const next = new Int32Array( Math.max( traceLen, trace.length * 2 ) );
      next.set( trace ), trace = next;
    }

    for ( let diag = -dist, i = 0; diag <= dist; diag += 2, i++ ) trace[ traceOff + i ] = frontier[ offset + diag ];
    if ( finished ) break;
  }

  let x = oLen, y = mLen;

  for ( let d = dist; d > 0; d-- ) {
    const prevOffset = ( d - 1 ) * d / 2, diag = x - y, prevDiag = diag === -d || ( diag !== d &&
      trace[ prevOffset + ( diag + d - 2 ) / 2 ] < trace[ prevOffset + ( diag + d ) / 2 ] )
      ? diag + 1 : diag - 1;

    const prevX = trace[ prevOffset + ( prevDiag + d - 1 ) / 2 ], prevY = prevX - prevDiag;

    while ( x > prevX && y > prevY ) pushEdit( 0 ), x--, y--;
    pushEdit( x === prevX ? 1 : 2 );
    x = prevX, y = prevY;
  }

  while ( x > 0 && y > 0 ) pushEdit( 0 ), x--, y--;
  while ( x-- ) pushEdit( 2 );
  while ( y-- ) pushEdit( 1 );
}
