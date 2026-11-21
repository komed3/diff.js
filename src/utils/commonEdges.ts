export function commonEdges < T > ( original: readonly T[], modified: readonly T[], equals: ( o: T, m: T ) => boolean ) {
  const [ n, m ] = [ original.length, modified.length ];
  let prefix = 0, suffix = 0;

  while ( prefix < n && prefix < m && equals( original[ prefix ], modified[ prefix ] ) ) prefix++;
  while ( suffix < n - prefix && suffix < m - prefix && equals( original[ n - suffix - 1 ], modified[ m - suffix - 1 ] ) ) suffix++;

  return { prefix, suffix };
}
