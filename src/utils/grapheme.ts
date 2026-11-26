export const createGraphemeSegmenter = ( locale?: string ) =>
  new Intl.Segmenter( locale, { granularity: 'grapheme' } );


const segmenter = createGraphemeSegmenter();


export const graphemeLength = ( text: string ) : number => {
  let count = 0;
  for ( const _ of segmenter.segment( text ) ) count++;
  return count;
};
