import type { HeatmapCell, HeatmapData, HeatmapOptions } from '../types/heatmap';
import type { Result } from '../types/engine';
import type { Line } from '../types/line';
import type { Token } from '../types/token';


export class Heatmap {
  public constructor ( private readonly result: Result ) {}

  public create ( { x = 'auto', y = 'auto', filter = 'all' }: HeatmapOptions = {} ) : HeatmapData {
    let maxWidth = 1, originalLines = 1, modifiedLines = 1;

    for ( const { original, modified } of this.result.script ) {
      if ( original ) {
        maxWidth = Math.max( maxWidth, original.value.length );
        originalLines = Math.max( originalLines, original.start + 1 );
      }

      if ( modified ) {
        maxWidth = Math.max( maxWidth, modified.value.length );
        modifiedLines = Math.max( modifiedLines, modified.start + 1 );
      }
    }

    const ratio = maxWidth / Math.max( originalLines, modifiedLines );
    const width = Math.max( 1, Math.floor( x === 'auto' ? y === 'auto' ? Math.sqrt( 256 * ratio ) : y * ratio : x ) );
    const height = Math.max( 1, Math.floor( y === 'auto' ? x === 'auto' ? 256 / width : width / ratio : y ) );
  }
}
