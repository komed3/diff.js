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
}
