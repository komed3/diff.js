import { Magnitude } from '../core/Magnitude';
import type { Result } from '../types/engine';
import type { Formatter, UnifiedData, UnifiedOptions } from '../types/formatter';
import type { TokenMeta } from '../types/tokenizer';
import { Base } from './Base';


export class Unified< T extends TokenMeta = {} > extends Base< T > implements Formatter< UnifiedData< T >, T > {
  private readonly magnitudeOptions: UnifiedOptions[ 'magnitude' ];

  public constructor ( options: UnifiedOptions = {} ) {
    super( options );
    this.magnitudeOptions = options.magnitude;
  }

  public format ( result: Result< T > ) : UnifiedData< T > {
    const { absolute, relative, percentage, boxes } = this.magnitudeOptions ?? {};

    return { granularity: this.granularity, hunks: this.getHunks( result ).map( hunk => {
      const magnitude = new Magnitude( hunk );

      return { ...hunk, magnitude: {
        ...( absolute ? { absolute: magnitude.absolute( absolute ) } : {} ),
        ...( relative ? { relative: magnitude.relative( relative ) } : {} ),
        ...( percentage ? { percentage: magnitude.percentage( percentage ) } : {} ),
        ...( boxes ? { boxes: magnitude.boxes( boxes ) } : {} )
      } };
    } ) };
  }
}
