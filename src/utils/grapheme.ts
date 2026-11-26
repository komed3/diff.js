const segmenters = new Map< string | undefined, Intl.Segmenter >();


export const graphemeSegmenter = ( locale?: string ) : Intl.Segmenter => {
  return segmenters.get( locale ) ?? ( () => {
    const segmenter = new Intl.Segmenter( locale, { granularity: 'grapheme' } );
    segmenters.set( locale, segmenter );

    return segmenter;
  } )();
};


export const graphemeLength = ( text: string, locale?: string ) : number => {
  let count = 0;
  for ( const _ of graphemeSegmenter( locale ).segment( text ) ) count++;
  return count;
};
