import type { Result } from '../types/engine';
import type { HeatmapCell, HeatmapData, HeatmapOptions } from '../types/heatmap';
import type { Line } from '../types/line';


const MAX_CELLS = 1_000_000;


export class Heatmap {
  public constructor ( private readonly result: Result ) {}

  public create ( { x = 'auto', y = 'auto', filter = 'all' }: HeatmapOptions = {} ) : HeatmapData {
    let maxWidth = 1, originalLines = 0, modifiedLines = 0;

    for ( const { original, modified, operation } of this.result.script ) {
      maxWidth = Math.max( maxWidth, original?.value.length ?? 0, modified?.value.length ?? 0 );
      originalLines = Math.max( originalLines, operation.original.start + operation.original.length );
      modifiedLines = Math.max( modifiedLines, operation.modified.start + operation.modified.length );
    }

    const ratio = maxWidth / Math.max( originalLines, modifiedLines, 1 );

    if ( x !== 'auto' && ( ! Number.isSafeInteger( x ) || x < 1 ) ) throw new RangeError( 'Invalid heatmap width' );
    if ( y !== 'auto' && ( ! Number.isSafeInteger( y ) || y < 1 ) ) throw new RangeError( 'Invalid heatmap height' );

    const width = Math.max( 1, Math.floor( x === 'auto' ? y === 'auto' ? Math.sqrt( 256 * ratio ) : y * ratio : x ) );
    const height = Math.max( 1, Math.floor( y === 'auto' ? x === 'auto' ? 256 / width : width / ratio : y ) );

    if ( ! Number.isSafeInteger( width * height ) || width * height > MAX_CELLS ) {
      throw new RangeError( `Heatmap exceeds the maximum size of ${ MAX_CELLS } cells` );
    }

    const values = new Float64Array( width * height * 3 ), cells: HeatmapCell[] = [];

    const add = ( row: number, rows: number, position: number, type: 'insert' | 'delete' | 'change', weight: number ) => {
      const px = Math.min( width - 1, Math.floor( position / maxWidth * width ) );
      const py = Math.min( height - 1, Math.floor( row / rows * height ) );
      const index = ( py * width + px ) * 3 + ( type === 'insert' ? 0 : type === 'delete' ? 1 : 2 );

      values[ index ] += weight;
    };

    const addLine = ( line: Line, row: number, rows: number, type: 'insert' | 'delete' | 'change' ) => {
      if ( ! line.value.length ) return add( row, rows, 0, type, 1 );
      for ( let i = 0; i < line.value.length; i++ ) add( row, rows, i, type, 1 );
    };

    for ( const { original, modified, operation, edit } of this.result.script ) {
      const { type } = operation;

      if ( type === 'equal' ) continue;

      if ( type === 'insert' || type === 'delete' ) {
        if ( filter !== 'all' && filter !== type ) continue;

        const insert = type === 'insert';
        const line = insert ? modified : original;
        const range = insert ? operation.modified : operation.original;
        const rows = insert ? modifiedLines : originalLines;

        if ( line ) addLine( line, range.start, rows, type );
        continue;
      }

      if ( ! edit ) {
        if ( filter === 'all' || filter === 'change' ) {
          if ( modified ) addLine( modified, operation.modified.start, modifiedLines, 'change' );
        }

        continue;
      }

      for ( const { type: t, original: o, modified: m } of edit.operations ) {
        if ( t === 'equal' ) continue;
        if ( filter !== 'all' && filter !== 'change' && filter !== t ) continue;

        const insert = t === 'insert';
        const line = insert ? modified : original;
        const range = insert ? m : o;
        const rows = insert ? modifiedLines : originalLines;
        const tokens = insert ? edit.modified : edit.original;

        if ( ! line ) continue;

        for ( let i = range.start; i < range.start + range.length; i++ ) {
          const { value, start } = tokens[ i ];
          add( insert ? operation.modified.start : operation.original.start, rows, start,
            t, Math.max( 1, value.length ) );
        }
      }
    }

    for ( let py = 0; py < height; py++ ) for ( let px = 0; px < width; px++ ) {
      const index = ( py * width + px ) * 3;
      const insert = values[ index ], del = values[ index + 1 ], change = values[ index + 2 ];
      const activity = insert + del + change;

      cells.push( {
        x: px, y: py, intensity: activity ? ( insert - del ) / activity : 0,
        activity, insert, delete: del, change
      } );
    }

    return { width, height, cells };
  }
}
