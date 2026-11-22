import type { Pair } from '../types/operation';


export function longestIncreasingSubsequence ( candidates: readonly Pair[] ) : Pair[] {
  const tails = new Int32Array( candidates.length ), prev = new Int32Array( candidates.length );
  let length = 0;

  for ( let i = 0; i < candidates.length; i++ ) {
    let low = 0, high = length;

    while ( low < high ) {
      const middle = ( low + high ) >>> 1;
      if ( candidates[ tails[ middle ] ].modified < candidates[ i ].modified ) low = middle + 1;
      else high = middle;
    }

    prev[ i ] = low ? tails[ low - 1 ] : -1, tails[ low ] = i;
    if ( low === length ) length++;
  }

  const seq: Pair[] = [];
  let node = length ? tails[ length - 1 ] : -1;

  while ( node >= 0 ) seq.push( candidates[ node ] ), node = prev[ node ];

  seq.reverse();
  return seq;
}
