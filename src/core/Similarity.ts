import type { LineScript, Result } from '../types/engine';
import type { SimilarityLine, SimilarityMode, SimilarityOptions, SimilarityWeight } from '../types/similarity';


export class Similarity {
  private readonly script: LineScript[];
  private readonly mode: SimilarityMode;
  private readonly weighting: SimilarityWeight;

  private entries?: SimilarityLine[];

  private weight ( { original, originalLength, modifiedLength }: SimilarityLine, mode: 'retention' | 'similarity' ) : number {
    if ( this.weighting === 'lines' ) return mode === 'retention' ? Number( original !== null ) : 1;
    return mode === 'retention' ? originalLength : Math.max( originalLength, modifiedLength );
  }

  public constructor ( { script }: Result, { mode = 'similarity', weighting = 'characters' }: SimilarityOptions = {} ) {
    this.script = script, this.mode = mode, this.weighting = weighting;
  }

  public lines () : SimilarityLine[] {
    return this.entries ??= this.script.map( entry => {
      const common = ( entry: LineScript ) => {
        if ( ! entry?.edit ) return null;
        let len = 0;

        for ( const { type, original: { start, length } } of entry.edit.operations ) {
          if ( type !== 'equal' ) continue;
          for ( let i = start; i < start + length; i++ ) len += entry.edit.original[ i ].value.length;
        }

        return len;
      };

      const { original, modified, operation: { type } } = entry;
      const oLen = original?.value.length ?? 0, mLen = modified?.value.length ?? 0;
      const len = type === 'equal' ? Math.min( oLen, mLen ) : type === 'change' ? common( entry ) : 0;

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
