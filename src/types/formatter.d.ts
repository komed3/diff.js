import type { Result } from './engine';
import type { HunkData, HunkOptions } from './hunk';
import type { MagnitudeBoxes, MagnitudeBoxesOptions } from './magnitude';
import type { LineOperation } from './operation';
import type { TokenMeta } from './tokenizer';


export type Granularity = 'line' | 'token';

export interface FormatterOptions extends HunkOptions {
  granularity?: Granularity;
}

export interface UnifiedOptions extends FormatterOptions {
  magnitude?: MagnitudeBoxesOptions;
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

export interface UnifiedHunk extends HunkData {
  readonly magnitude: MagnitudeBoxes;
}

export interface UnifiedData extends FormatterData {
  readonly hunks: readonly UnifiedHunk[];
}

export interface Formatter< O, T extends TokenMeta = {} > {
  format ( result: Result< T > ) : O;
}
