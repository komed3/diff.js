import type { Algorithm, HistogramOptions } from '../types/algorithm';
import type { Operation } from '../types/operation';
import { Myers } from './Myers';


export class Histogram implements Algorithm {
  private readonly getKey?: ( value: unknown ) => PropertyKey;

  public constructor ( { getKey }: HistogramOptions = {} ) {
    this.getKey = getKey;
  }

  public diff < T > ( original: readonly T[], modified: readonly T[], equals: ( original: T, modified: T ) => boolean ) : Operation[] {
    const edits: ( 0 | 1 | 2 )[] = [], fallback = new Myers();

    const process = ( oStart: number, oEnd: number, mStart: number, mEnd: number ) => {
      const groups: { value: T; original: number[]; modified: number[] }[] = [];
      const buckets = new Map< PropertyKey, typeof groups >();

      for ( let i = oStart; i < oEnd; i++ ) {
        let candidates = groups, key: PropertyKey | undefined;
        if ( this.getKey ) key = this.getKey( original[ i ] ), candidates = buckets.get( key ) ?? [];
        let group = candidates.find( ( { value } ) => equals( value, original[ i ] ) );

        if ( ! group ) {
          group = { value: original[ i ], original: [], modified: [] };
          groups.push( group );

          if ( this.getKey ) {
            const bucket = buckets.get( key! );

            if ( bucket ) bucket.push( group );
            else buckets.set( key!, [ group ] );
          }
        }

        group.original.push( i );
      }

      for ( let j = mStart; j < mEnd; j++ ) {
        let candidates = groups;
        if ( this.getKey ) candidates = buckets.get( this.getKey( modified[ j ] ) ) ?? [];

        const group = candidates.find( ( { value } ) => equals( value, modified[ j ] ) );
        if ( group ) group.modified.push( j );
      }

      const candidates: { original: number; modified: number }[] = [];
      let frequency = Infinity;

      for ( const group of groups ) {
        if ( ! group.modified.length ) continue;

        const current = group.original.length + group.modified.length;
        if ( current < frequency ) frequency = current, candidates.length = 0;
        if ( current !== frequency ) continue;

        for ( let i = 0; i < Math.min( group.original.length, group.modified.length ); i++ )
          candidates.push( { original: group.original[ i ], modified: group.modified[ i ] } );
      }

      candidates.sort( ( a, b ) => a.original - b.original );

      const tails: number[] = [], previous = new Int32Array( candidates.length );
      previous.fill( -1 );

      for ( let i = 0; i < candidates.length; i++ ) {
        let low = 0, high = tails.length;

        while ( low < high ) {
          const middle = ( low + high ) >>> 1;

          if ( candidates[ tails[ middle ] ].modified < candidates[ i ].modified ) low = middle + 1;
          else high = middle;
        }

        if ( low ) previous[ i ] = tails[ low - 1 ];
        tails[ low ] = i;
      }

      const anchors = [];
      let node = tails[ tails.length - 1 ];

      while ( node !== undefined && node >= 0 ) anchors.push( candidates[ node ] ), node = previous[ node ];

      anchors.reverse();

      if ( ! anchors.length ) {
        for ( const op of fallback.diff( original.slice( oStart, oEnd ), modified.slice( mStart, mEnd ), equals ) ) {
          const code = op.type === 'equal' ? 0 : op.type === 'insert' ? 1 : 2;
          const length = op.type === 'insert' ? op.modified.length : op.original.length;

          for ( let i = 0; i < length; i++ ) edits.push( code );
        }

        return;
      }

      let [ origIdx, modIdx ] = [ oStart, mStart ];

      for ( const anchor of anchors ) {
        process( origIdx, anchor.original, modIdx, anchor.modified );

        edits.push( 0 );
        origIdx = anchor.original + 1, modIdx = anchor.modified + 1;
      }

      process( origIdx, oEnd, modIdx, mEnd );
    };

    process( 0, original.length, 0, modified.length );

    const operations: Operation[] = [];
    let [ origIdx, modIdx ] = [ 0, 0 ];

    for ( let i = 0; i < edits.length; ) {
      const code = edits[ i ], type = code === 0 ? 'equal' : code === 1 ? 'insert' : 'delete', start = i;
      while ( i < edits.length && edits[ i ] === code ) i++;
      const length = i - start;

      operations.push( {
        type,
        original: { start: origIdx, length: type === 'insert' ? 0 : length },
        modified: { start: modIdx, length: type === 'delete' ? 0 : length }
      } as Operation );

      if ( type !== 'insert' ) origIdx += length;
      if ( type !== 'delete' ) modIdx += length;
    }

    return operations;
  }
}
