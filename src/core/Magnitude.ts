import type { MetricStats } from '../types/analyze';
import type { HunkData } from '../types/hunk';
import type {
  MagnitudeAbsolute, MagnitudeBoxes, MagnitudeBoxesOptions, MagnitudeOptions,
  MagnitudePercentage, MagnitudePercentageOptions, MagnitudeRelative, MagnitudeValue
} from '../types/magnitude';
import { assertOption } from '../utils/assert';


const bases = [ 'original', 'modified', 'combined', 'maximum' ];


export class Magnitude {
  private readonly stats: MetricStats;
  private readonly operations = { insert: 0, delete: 0, change: 0 };

  private value ( { metric = 'changed', base = 'original' }: MagnitudeOptions = {} ) : MagnitudeValue {
    assertOption( Object.hasOwn( this.stats, metric ), 'magnitude metric' );
    assertOption( typeof base === 'number' ? Number.isFinite( base ) && base >= 0 : bases.includes( base ), 'magnitude base' );

    const { original, modified } = this.stats;
    return { value: this.stats[ metric ], baseValue: typeof base === 'number' ? base : base === 'original' ?
      original : base === 'modified' ? modified : base === 'combined' ? original + modified : Math.max( original, modified )
    };
  }

  public constructor ( hunk: HunkData | null ) {
    const stats = { original: 0, modified: 0, equal: 0, inserted: 0, deleted: 0, changed: 0 };

    for ( const { operation: { type, original: { length: ol }, modified: { length: ml } } } of hunk?.lines ?? [] ) {
      if ( type !== 'insert' ) stats.original += ol;
      if ( type !== 'delete' ) stats.modified += ml;

      if ( type === 'equal' ) stats.equal += ol;
      else if ( type === 'insert' ) stats.inserted += ml, this.operations.insert++;
      else if ( type === 'delete' ) stats.deleted += ol, this.operations.delete++;
      else stats.changed += Math.max( ol, ml ), this.operations.change++;
    }

    const { original, modified, equal, inserted, deleted, changed } = stats;
    const delta = modified - original, size = original + modified;

    this.stats = { ...stats, delta,
      changeRate: size ? ( inserted + deleted + changed * 2 ) / size : 0,
      insertionRate: modified ? inserted / modified : 0,
      deletionRate: original ? deleted / original : 0,
      retentionRate: original ? equal / original : 0,
      growthRate: original ? delta / original : null,
      sizeRatio: original ? modified / original : null
    };
  }

  public absolute ( options: MagnitudeOptions = {} ) : MagnitudeAbsolute {
    const { value, baseValue } = this.value( options );
    return { value, baseValue, magnitude: value === null ? null : Math.abs( value ) };
  }

  public relative ( options: MagnitudeOptions = {} ) : MagnitudeRelative {
    const { value, baseValue } = this.value( options );
    return { value, baseValue, ratio: value === null || ! baseValue ? null : value / baseValue };
  }

  public percentage ( { precision = 1, ...options }: MagnitudePercentageOptions = {} ) : MagnitudePercentage {
    assertOption( Number.isSafeInteger( precision ) && precision >= 0 && precision <= 100, 'magnitude precision' );

    const { value, baseValue } = this.value( options ), f = 10 ** precision;
    return { value, baseValue, percentage: value === null || ! baseValue ? null : Math.round( value / baseValue * 100 * f ) / f };
  }

  public boxes ( { total = 5, ...options }: MagnitudeBoxesOptions = {} ) : MagnitudeBoxes {
    assertOption( Number.isSafeInteger( total ) && total >= 1, 'magnitude box count' );

    const { value, baseValue } = this.value( options );
    const filled = value === null || ! baseValue ? null : Math.min( total, Math.round( Math.abs( value / baseValue ) * total ) );
    return { value, baseValue, ...this.operations, filled, empty: filled === null ? null : total - filled, total };
  }
}
