import type { Result } from './engine';
import type { HunkData, HunkOptions } from './hunk';
import type {
  MagnitudeAbsolute, MagnitudeBoxes, MagnitudeBoxesOptions, MagnitudeOptions,
  MagnitudePercentage, MagnitudePercentageOptions, MagnitudeRelative
} from './magnitude';
import type { TokenMeta } from './tokenizer';


export type Granularity = 'line' | 'token';
export type FormatSide = 'inline' | 'original' | 'modified';

export interface FormatterOptions extends HunkOptions {
  granularity?: Granularity;
}

export interface FormatterData {
  readonly granularity: Granularity;
}

export interface InlineToken {
  readonly type: 'equal' | 'insert' | 'delete';
  readonly value: string;
}

export interface InlineLine {
  readonly number: number;
  readonly tokens: readonly InlineToken[];
}

export interface InlineData extends FormatterData {
  readonly lines: readonly InlineLine[];
}

export interface SideBySideRow {
  readonly original: InlineLine | null;
  readonly modified: InlineLine | null;
}

export interface SideBySideData extends FormatterData {
  readonly rows: readonly SideBySideRow[];
}

export interface UnifiedOptions extends FormatterOptions {
  magnitude?: {
    absolute?: MagnitudeOptions;
    relative?: MagnitudeOptions;
    percentage?: MagnitudePercentageOptions;
    boxes?: MagnitudeBoxesOptions;
  };
}

export interface UnifiedHunk< T extends TokenMeta = {} > extends HunkData< T > {
  readonly magnitude: {
    absolute?: MagnitudeAbsolute;
    relative?: MagnitudeRelative;
    percentage?: MagnitudePercentage;
    boxes?: MagnitudeBoxes;
  };
}

export interface UnifiedData< T extends TokenMeta = {} > extends FormatterData {
  readonly hunks: readonly UnifiedHunk< T >[];
}

export interface Formatter< O extends FormatterData, T extends TokenMeta = {} > {
  format ( result: Result< T > ) : O;
}
