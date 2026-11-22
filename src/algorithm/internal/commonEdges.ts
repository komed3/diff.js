export function commonEdges < T > (
  original: readonly T[], modified: readonly T[], equals: ( o: T, m: T ) => boolean,
  oStart = 0, oEnd = original.length, mStart = 0, mEnd = modified.length
) : { prefix: number, suffix: number } {
  let prefix = 0, suffix = 0;

  while ( oStart + prefix < oEnd && mStart + prefix < mEnd &&
    equals( original[ oStart + prefix ], modified[ mStart + prefix ] ) ) prefix++;

  while ( oEnd - suffix > oStart + prefix && mEnd - suffix > mStart + prefix &&
    equals( original[ oEnd - suffix - 1 ], modified[ mEnd - suffix - 1 ] ) ) suffix++;

  return { prefix, suffix };
}
