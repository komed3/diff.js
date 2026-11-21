import type { Algorithm, PatienceOptions } from '../types/algorithm';
import type { Operation } from '../types/operation';
import { appendOperations, createOperations } from '../utils/EditScript';
import { longestIncreasingSubsequence } from '../utils/LIS';
import { Myers } from './Myers';


export class Patience implements Algorithm {
  private readonly getKey?: ( value: unknown ) => PropertyKey;

  public constructor ( { getKey }: PatienceOptions = {} ) {
    this.getKey = getKey;
  }

  public diff < T > ( original: readonly T[], modified: readonly T[], equals: ( original: T, modified: T ) => boolean ) : Operation[] {
    const edits: ( 0 | 1 | 2 )[] = [], fallback = new Myers();

    const process = ( oStart: number, oEnd: number, mStart: number, mEnd: number ) => {
      const candidates: { original: number; modified: number }[] = [];

      if ( this.getKey ) {
        const oPos = new Map< PropertyKey, { count: number; index: number } >();
        const mPos = new Map< PropertyKey, { count: number; index: number } >();

        for ( let j = mStart; j < mEnd; j++ ) {
          const key = this.getKey( modified[ j ] ), pos = mPos.get( key );

          if ( pos ) pos.count++;
          else mPos.set( key, { count: 1, index: j } );
        }

        for ( let i = oStart; i < oEnd; i++ ) {
          const key = this.getKey( original[ i ] ), pos = oPos.get( key );

          if ( pos ) pos.count++;
          else oPos.set( key, { count: 1, index: i } );
        }

        for ( let i = oStart; i < oEnd; i++ ) {
          const key = this.getKey( original[ i ] ), pos = mPos.get( key );

          if ( oPos.get( key )?.count === 1 && pos?.count === 1 && equals( original[ i ], modified[ pos.index ] ) )
            candidates.push( { original: i, modified: pos.index } );
        }
      } else {
        const oCounts = new Uint32Array( oEnd - oStart ), mCounts = new Uint32Array( mEnd - mStart );
        const oMatches = new Int32Array( oEnd - oStart ), mMatches = new Int32Array( mEnd - mStart );

        for ( let i = oStart; i < oEnd; i++ ) for ( let j = mStart; j < mEnd; j++ ) {
          if ( ! equals( original[ i ], modified[ j ] ) ) continue;

          oCounts[ i - oStart ]++, mCounts[ j - mStart ]++;
          oMatches[ i - oStart ] = j, mMatches[ j - mStart ] = i;
        }

        for ( let i = oStart; i < oEnd; i++ ) {
          const oi = i - oStart, j = oMatches[ oi ];
          if ( oCounts[ oi ] === 1 && mCounts[ j - mStart ] === 1 ) candidates.push( { original: i, modified: j } );
        }
      }

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
