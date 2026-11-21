import type { Algorithm, HistogramOptions } from '../types/algorithm';
import type { Operation, Pair } from '../types/operation';
import { createOperations } from '../utils/createOperations';
import { findCommonEdges } from '../utils/findCommonEdges';
import { processAnchors } from '../utils/processAnchors';


export class Histogram implements Algorithm {
  private readonly getKey?: ( value: unknown ) => PropertyKey;

  public constructor ( { getKey }: HistogramOptions = {} ) {
    this.getKey = getKey;
  }

  public diff < T > ( original: readonly T[], modified: readonly T[], equals: ( o: T, m: T ) => boolean ) : Operation[] {
    const edits: ( 0 | 1 | 2 )[] = [];

    const process = ( oStart: number, oEnd: number, mStart: number, mEnd: number ) => {
      const { prefix, suffix } = findCommonEdges( original.slice( oStart, oEnd ), modified.slice( mStart, mEnd ), equals );
      for ( let i = 0; i < prefix; i++ ) edits.push( 0 );

      const groups: { value: T; original: number[]; modified: number[] }[] = [];
      const buckets = this.getKey ? new Map< PropertyKey, typeof groups >() : undefined;
      oStart += prefix, mStart += prefix, oEnd -= suffix, mEnd -= suffix;

      for ( let i = oStart; i < oEnd; i++ ) {
        const key = this.getKey?.( original[ i ] ), candidates = buckets ? buckets.get( key! ) ?? [] : groups;
        let group = candidates.find( ( { value } ) => equals( value, original[ i ] ) );

        if ( ! group ) {
          group = { value: original[ i ], original: [], modified: [] };
          groups.push( group );

          if ( buckets ) {
            const bucket = buckets.get( key! );

            if ( bucket ) bucket.push( group );
            else buckets.set( key!, [ group ] );
          }
        }

        group.original.push( i );
      }

      for ( let j = mStart; j < mEnd; j++ ) {
        const candidates = buckets ? buckets.get( this.getKey!( modified[ j ] ) ) ?? [] : groups;
        const group = candidates.find( ( { value } ) => equals( value, modified[ j ] ) );

        if ( group ) group.modified.push( j );
      }

      const candidates: Pair[] = [];
      let frequency = Infinity;

      for ( const group of groups ) {
        if ( ! group.modified.length || group.original.length !== group.modified.length ) continue;

        const current = group.original.length + group.modified.length;
        if ( current < frequency ) frequency = current, candidates.length = 0;
        if ( current !== frequency ) continue;

        for ( let i = 0; i < group.original.length; i++ )
          candidates.push( { original: group.original[ i ], modified: group.modified[ i ] } );
      }

      candidates.sort( ( a, b ) => a.original - b.original );
      processAnchors( candidates, edits, original, modified, equals, oStart, oEnd, mStart, mEnd, process );
      for ( let i = 0; i < suffix; i++ ) edits.push( 0 );
    };

    process( 0, original.length, 0, modified.length );
    return createOperations( edits );
  }
}
