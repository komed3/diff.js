import type { EditScript, Result } from '../types/engine';
import type { LineSimilarity, TokenSimilarity } from '../types/similarity';


export class Similarity {
  private score ( { original, modified, operations }: EditScript ) : number {
    const total = Math.max( original.length, modified.length );
    if ( total === 0 ) return 0;

    let equal = 0;
    for ( const operation of operations ) if ( operation.type === 'equal' )
      equal += operation.original.length;

    return equal / total;
  }

  public constructor ( private readonly result: Result ) {}

  public lines () : LineSimilarity[] {
    return this.result.script.map( ( { operation: { type, original, modified }, edit } ) => ( {
      original: original.length ? original.start : null, modified: modified.length ? modified.start : null,
      type, similarity: type === 'equal' ? 1 : type === 'change' && edit ? this.score( edit ) : 0
    } ) );
  }

  public tokens () : TokenSimilarity[] {
    const tokens: TokenSimilarity[] = [];

    for ( const { edit, operation: { original, modified } } of this.result.script ) {
      if ( ! edit ) continue;

      const originalLine = original.start, modifiedLine = modified.start;

      for ( const { type, original, modified } of edit.operations ) {
        const count = Math.max( original.length, modified.length );

        for ( let i = 0; i < count; i++ ) tokens.push( {
          type, originalLine, modifiedLine,
          original: i < original.length ? original.start + i : null,
          modified: i < modified.length ? modified.start + i : null,
          similarity: type === 'equal' ? 1 : 0
        } );
      }
    }

    return tokens;
  }
}
