import type { CharacterBaseMetric, CharacterCounts, CharacterMetric, MetricBaseStats, MetricStats } from '../types/analyze';
import type { Result } from '../types/engine';


export class Analyzer {
  private encoder?: TextEncoder;

  private metric ( { original, modified, equal, inserted, deleted, changed }: MetricBaseStats ) : MetricStats {
    const delta = modified - original, size = Math.max( original, modified );

    return {
      original, modified, equal, inserted, deleted, changed, delta,
      changeRate: size === 0 ? 0 : ( inserted + deleted + changed ) / size,
      insertionRate: modified === 0 ? 0 : inserted / modified,
      deletionRate: original === 0 ? 0 : deleted / original,
      retentionRate: original === 0 ? 0 : equal / original,
      growthRate: original === 0 ? null : delta / original,
      sizeRatio: original === 0 ? null : modified / original
    };
  }

  private counts ( text: string ) : CharacterCounts {
    let unicodeCodePoints = 0;
    for ( const _ of text ) unicodeCodePoints++;

    return {
      utf16CodeUnits: text.length, unicodeCodePoints,
      utf8Bytes: ( this.encoder ??= new TextEncoder() ).encode( text ).length
    };
  }

  private add ( target: CharacterCounts, text: string ) : void {
    const { utf16CodeUnits, unicodeCodePoints, utf8Bytes } = this.counts( text );

    target.utf16CodeUnits += utf16CodeUnits;
    target.unicodeCodePoints += unicodeCodePoints;
    target.utf8Bytes += utf8Bytes;
  }

  private characterMetric ( { original, modified, equal, inserted, deleted, changed }: CharacterBaseMetric ) : CharacterMetric {
    return {
      original, modified, equal, inserted, deleted, changed, delta: modified - original,
      changeRate: original + modified === 0 ? 0 : ( inserted + deleted + changed.original +
        changed.modified ) / ( original + modified )
    };
  }

  public constructor ( private readonly result: Result ) {}
}
