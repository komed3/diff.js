import type { Algorithm, PatienceOptions } from '../types/algorithm';
import type { Operation } from '../types/operation';
import { createOperations } from '../utils/createOperations';
import { processAnchors } from '../utils/processAnchors';


export class Patience implements Algorithm {
  private readonly getKey?: ( value: unknown ) => PropertyKey;

  public constructor ( { getKey }: PatienceOptions = {} ) {
    this.getKey = getKey;
  }

  public diff < T > ( original: readonly T[], modified: readonly T[], equals: ( o: T, m: T ) => boolean ) : Operation[] {
    const edits: ( 0 | 1 | 2 )[] = [];

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
        const oCounts = new Uint8Array( oEnd - oStart ), mCounts = new Uint8Array( mEnd - mStart );
        const oMatches = new Int32Array( oEnd - oStart );

        for ( let i = oStart; i < oEnd; i++ ) for ( let j = mStart; j < mEnd; j++ ) {
          if ( ! equals( original[ i ], modified[ j ] ) ) continue;

          if ( oCounts[ i - oStart ] < 2 ) oCounts[ i - oStart ]++;
          if ( mCounts[ j - mStart ] < 2 ) mCounts[ j - mStart ]++;
          oMatches[ i - oStart ] = j;
        }

        for ( let i = oStart; i < oEnd; i++ ) {
          const oi = i - oStart, j = oMatches[ oi ];
          if ( oCounts[ oi ] === 1 && mCounts[ j - mStart ] === 1 ) candidates.push( { original: i, modified: j } );
        }
      }

      processAnchors( candidates, edits, original, modified, equals, oStart, oEnd, mStart, mEnd, process );
    };

    process( 0, original.length, 0, modified.length );
    return createOperations( edits );
  }
}
