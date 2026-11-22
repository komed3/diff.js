import type { Bounds, Input } from '../../types/context';


export function commonEdges < T > ( input: Input< T >, bounds: Bounds ) : { prefix: number, suffix: number } {
  const { original, modified, equals } = input, { oStart, oEnd, mStart, mEnd } = bounds;
  let prefix = 0, suffix = 0;

  while ( oStart + prefix < oEnd && mStart + prefix < mEnd &&
    equals( original[ oStart + prefix ], modified[ mStart + prefix ] ) ) prefix++;

  while ( oEnd - suffix > oStart + prefix && mEnd - suffix > mStart + prefix &&
    equals( original[ oEnd - suffix - 1 ], modified[ mEnd - suffix - 1 ] ) ) suffix++;

  return { prefix, suffix };
}
