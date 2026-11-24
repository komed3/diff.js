import type { CharacterCounts, MetricBaseStats, MetricStats } from '../types/analyze';
import type { Result } from '../types/engine';


export class Analyzer {
  private encoder?: TextEncoder;

  private metric ( { original, modified, equal, inserted, deleted, changed }: MetricBaseStats ) : MetricStats {
    const delta = modified - original;

    return {
      original, modified, equal, inserted, deleted, changed, delta,
      changeRate: Math.max( original, modified ) === 0 ? 0 : ( inserted + deleted + changed ) / Math.max( original, modified ),
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

  public constructor ( private readonly result: Result ) {}
}
