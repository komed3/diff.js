import type { Pair } from '../types/operation';


export function longestIncreasingSubsequence ( candidates: readonly Pair[] ) : Pair[] {
  const tails: number[] = [], prev = new Int32Array( candidates.length );
  prev.fill( -1 );

  for ( let i = 0; i < candidates.length; i++ ) {
    let low = 0, high = tails.length;

    while ( low < high ) {
      const middle = ( low + high ) >>> 1;

      if ( candidates[ tails[ middle ] ].modified < candidates[ i ].modified ) low = middle + 1;
      else high = middle;
    }

    if ( low ) prev[ i ] = tails[ low - 1 ];
    tails[ low ] = i;
  }

  const seq: Pair[] = [];
  let node = tails[ tails.length - 1 ];

  while ( node !== undefined && node >= 0 ) seq.push( candidates[ node ] ), node = prev[ node ];

  seq.reverse();
  return seq;
}