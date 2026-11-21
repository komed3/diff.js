import type { Algorithm, HistogramOptions } from '../types/algorithm';
import type { Operation, Pair } from '../types/operation';
import { appendOperations, createOperations } from '../utils/EditScript';
import { longestIncreasingSubsequence } from '../utils/LIS';
import { Myers } from './Myers';


export class Histogram implements Algorithm {
  private readonly getKey?: ( value: unknown ) => PropertyKey;

  public constructor ( { getKey }: HistogramOptions = {} ) {
    this.getKey = getKey;
  }

  public diff < T > ( original: readonly T[], modified: readonly T[], equals: ( o: T, m: T ) => boolean ) : Operation[] {
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

      const candidates: Pair[] = [];
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
      const anchors = longestIncreasingSubsequence( candidates );

      if ( ! anchors.length ) return appendOperations(
        edits, fallback.diff( original.slice( oStart, oEnd ), modified.slice( mStart, mEnd ), equals )
      );

      let [ origIdx, modIdx ] = [ oStart, mStart ];

      for ( const anchor of anchors ) {
        process( origIdx, anchor.original, modIdx, anchor.modified );

        edits.push( 0 );
        origIdx = anchor.original + 1, modIdx = anchor.modified + 1;
      }

      process( origIdx, oEnd, modIdx, mEnd );
    };

    process( 0, original.length, 0, modified.length );
    return createOperations( edits );
  }
}
