import type { Bounds, Sequence } from '../../types/context';


export function commonEdges < T > (
  { original, modified, equals }: Sequence< T >,
  { oStart, oEnd, mStart, mEnd }: Bounds
) {
  let prefix = 0, suffix = 0;

  while ( oStart + prefix < oEnd && mStart + prefix < mEnd &&
    equals( original[ oStart + prefix ], modified[ mStart + prefix ] ) ) prefix++;

  while ( oEnd - suffix > oStart + prefix && mEnd - suffix > mStart + prefix &&
    equals( original[ oEnd - suffix - 1 ], modified[ mEnd - suffix - 1 ] ) ) suffix++;

  return { prefix, suffix };
}
