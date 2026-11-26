import type { LineScript, Result } from '../types/engine';
import type { SimilarityLine, SimilarityMode, SimilarityOptions, SimilarityWeight } from '../types/similarity';
import { assertOption } from '../utils/assert';
import { graphemeLength } from '../utils/grapheme';


export class Similarity {
  private readonly length: ( text: string ) => number;
  private readonly script: LineScript[];
  private readonly mode: SimilarityMode;
  private readonly weighting: SimilarityWeight;

  private entries?: SimilarityLine[];

  private commonLength ( entry: LineScript ) : number | null {
    if ( ! entry.edit ) return null;

    const { edit: { original, operations } } = entry;
    let len = 0;

    for ( const { type, original: { start, length: count } } of operations ) {
      if ( type !== 'equal' ) continue;
      for ( let i = start; i < start + count; i++ ) len += this.length( original[ i ].value );
    }

    return len;
  }

  private weight ( { original, originalLength, modifiedLength }: SimilarityLine, mode: 'retention' | 'similarity' ) : number {
    if ( this.weighting === 'lines' ) return mode === 'retention' ? Number( original !== null ) : 1;
    return mode === 'retention' ? originalLength : Math.max( originalLength, modifiedLength );
  }

  private score ( mode: 'retention' | 'similarity' ) : number | null {
    const lines = this.lines();
    let total = 0, weight = 0;

    for ( const entry of lines ) {
      const value = entry[ mode ], w = this.weight( entry, mode );

      if ( ! w ) continue;
      if ( value === null ) return null;

      total += value * w, weight += w;
    }

    if ( weight ) return total / weight;
    return lines.every( ( { type } ) => type === 'equal' ) ? 1 : 0;
  }

  public constructor ( { script }: Result, { mode = 'similarity', weighting = 'characters', locale }: SimilarityOptions = {} ) {
    assertOption( [ 'retention', 'similarity', 'combined' ].includes( mode ), 'similarity mode' );
    assertOption( [ 'lines', 'characters' ].includes( weighting ), 'similarity weighting' );
    assertOption( ! locale || typeof locale === 'string', 'similarity locale' );

    this.length = text => graphemeLength( text, locale );
    this.script = script, this.mode = mode, this.weighting = weighting;
  }

  public lines () : SimilarityLine[] {
    return this.entries ??= this.script.map( entry => {
      const { original, modified, operation: { type } } = entry;
      const oLen = original ? this.length( original.value ) : 0, mLen = modified ? this.length( modified.value ) : 0;
      const len = type === 'equal' ? Math.min( oLen, mLen ) : type === 'change' ? this.commonLength( entry ) : 0;

      const retention = type === 'equal' ? 1 : len === null ? null :
        oLen === 0 ? Number( mLen === 0 ) : Math.min( 1, len / oLen );

      const similarity = type === 'equal' ? 1 : len === null ? null :
        Math.max( oLen, mLen ) === 0 ? 1 : Math.min( 1, len / Math.max( oLen, mLen ) );

      return {
        original: original ? entry.operation.original.start : null,
        modified: modified ? entry.operation.modified.start : null,
        retention, similarity, type, originalLength: oLen, modifiedLength: mLen, commonLength: len,
        combined: retention === null || similarity === null ? null : ( retention + similarity ) / 2
      };
    } );
  }

  public get () : number | null {
    if ( this.mode === 'retention' ) return this.score( 'retention' );
    if ( this.mode === 'similarity' ) return this.score( 'similarity' );

    const retention = this.score( 'retention' ), similarity = this.score( 'similarity' );
    return retention === null || similarity === null ? null : ( retention + similarity ) / 2;
  }
}
