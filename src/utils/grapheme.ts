export const createGraphemeSegmenter = ( locale?: string ) =>
  new Intl.Segmenter( locale, { granularity: 'grapheme' } );


export const graphemeLength = ( text: string, locale?: string ) : number => {
  let count = 0;
  for ( const _ of createGraphemeSegmenter( locale ).segment( text ) ) count++;
  return count;
};
