import { assertOption } from './assert';


const segmenters = new Map< string | undefined, Intl.Segmenter >();


export const graphemeSegmenter = ( locale?: string ) : Intl.Segmenter => {
  assertOption( locale === undefined || typeof locale === 'string', 'locale' );

  return segmenters.get( locale ) ?? ( () => {
    const segmenter = new Intl.Segmenter( locale, { granularity: 'grapheme' } );
    segmenters.set( locale, segmenter );

    return segmenter;
  } )();
};


export const graphemeLength = ( text: string, locale?: string ) : number =>
  [ ...graphemeSegmenter( locale ).segment( text ) ].length;
