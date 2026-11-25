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
    const values = new Float64Array( width * height * 3 );

    const add = ( line: Line, lines: number, position: number, type: 'insert' | 'delete' | 'change', weight: number ) => {
      const px = Math.min( width - 1, Math.floor( position / maxWidth * width ) );
      const py = Math.min( height - 1, Math.floor( line.start / lines * height ) );
      const index = ( py * width + px ) * 3 + ( type === 'insert' ? 0 : type === 'delete' ? 1 : 2 );

      values[ index ] += weight;
    };

    const addLine = ( line: Line, lines: number, type: 'insert' | 'delete' | 'change' ) => {
      if ( ! line.value.length ) return add( line, lines, 0, type, 1 );
      for ( let i = 0; i < line.value.length; i++ ) add( line, lines, i, type, 1 );
    };

    for ( const { original, modified, operation: { type }, edit } of this.result.script ) {
      if ( type === 'equal' ) continue;

      if ( type === 'insert' || type === 'delete' ) {
        if ( filter !== 'all' && filter !== type ) continue;

        const line = type === 'insert' ? modified : original;
        const lines = type === 'insert' ? modifiedLines : originalLines;

        if ( line ) addLine( line, lines, type );
        continue;
      }

      if ( ! edit ) {
        if ( filter === 'all' || filter === 'change' ) if ( modified ) addLine( modified, modifiedLines, 'change' );
        continue;
      }

      for ( const { type: t, original: o, modified: m } of edit.operations ) {
        if ( t === 'equal' ) continue;
        if ( filter !== 'all' && filter !== 'change' && filter !== t ) continue;

        const insert = t === 'insert';
        const line = insert ? modified : original;
        const lines = insert ? modifiedLines : originalLines;
        const tokens = insert ? edit.modified : edit.original;
        const range = insert ? m : o;

        if ( ! line ) continue;

        for ( let i = range.start; i < range.start + range.length; i++ ) {
          const token = tokens[ i ];
          add( line, lines, token.start, t, Math.max( 1, token.value.length ) );
        }
      }
    }
  }
}
