import type { Result } from './engine';
import type { HunkData, HunkOptions } from './hunk';
import type {
  MagnitudeAbsolute, MagnitudeBoxes, MagnitudeBoxesOptions, MagnitudeOptions,
  MagnitudePercentage, MagnitudePercentageOptions, MagnitudeRelative
} from './magnitude';
import type { LineOperation } from './operation';
import type { TokenMeta } from './tokenizer';


export type Granularity = 'line' | 'token';

export interface FormatterOptions extends HunkOptions {
  granularity?: Granularity;
}

export interface FormatterData {
  readonly granularity: Granularity;
}

export interface InlinePart {
  readonly type: 'equal' | 'insert' | 'delete';
  readonly value: string;
}

export interface InlineData extends FormatterData {
  readonly granularity: Granularity;
  readonly parts: readonly InlinePart[];
}

export interface SideBySideRow {
  readonly operation: LineOperation[ 'type' ];
  readonly original: readonly InlinePart[] | null;
  readonly modified: readonly InlinePart[] | null;
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

export interface UnifiedHunk extends HunkData {
  readonly magnitude: {
    absolute?: MagnitudeAbsolute;
    relative?: MagnitudeRelative;
    percentage?: MagnitudePercentage;
    boxes?: MagnitudeBoxes;
  };
}

export interface UnifiedData extends FormatterData {
  readonly hunks: readonly UnifiedHunk[];
}

export interface Formatter< O, T extends TokenMeta = {} > {
  format ( result: Result< T > ) : O;
}
