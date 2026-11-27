import { Hunk } from '../core/Hunk';
import type { Result } from '../types/engine';
import type { Formatter, FormatterOptions, Granularity, InlineData, InlinePart } from '../types/formatter';
import type { TokenMeta } from '../types/tokenizer';


export class Inline< T extends TokenMeta = {} > implements Formatter< InlineData, T > {
  private readonly hunk: Hunk;
  private readonly context: number | 'all';
  private readonly granularity: Granularity;

  private append ( parts: InlinePart[], type: InlinePart[ 'type' ], value: string ) {
    if ( ! value ) return;

    const last = parts[ parts.length - 1 ];
    if ( last?.type === type ) parts[ parts.length - 1 ] = { type, value: last.value + value };
    else parts.push( { type, value } );
  }

  public constructor ( { context = 3, granularity = 'line' }: FormatterOptions ) {
    this.hunk = new Hunk( { context } ), this.context = context, this.granularity = granularity;
  }

  public format ( result: Result< T > ) : InlineData {
    const lines = this.context === 'all' ? result.script : this.hunk.create( result ).flatMap( ( { lines } ) => lines );
    const parts: InlinePart[] = [];

    for ( const { original, modified, operation: { type }, edit } of lines ) {
      if ( type !== 'change' ) {
        const line = original ?? modified;
        this.append( parts, type, line!.value + line!.ending );
      } else if ( this.granularity === 'token' && edit ) {
        for ( const item of edit.operations ) {
          const side = item.type === 'insert' ? 'modified' : 'original', range = item[ side ];

          this.append( parts, item.type, edit[ side ].slice( range.start, range.start + range.length )
            .map( ( { value } ) => value ).join( '' ) );
        }

        this.append( parts, original!.ending === modified!.ending ? 'equal' : 'delete', original!.ending );
        if ( original!.ending !== modified!.ending ) this.append( parts, 'insert', modified!.ending );
      }

      else {
        this.append( parts, 'delete', original!.value + original!.ending );
        this.append( parts, 'insert', modified!.value + modified!.ending );
      }
    }

    return { granularity: this.granularity, parts };
  }
}
