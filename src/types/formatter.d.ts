import type { Magnitude } from '../core/Magnitude';
import type { LineScript, Result } from './engine';
import type { HunkData, HunkOptions } from './hunk';
import type { TokenMeta } from './tokenizer';


export type Granularity = 'line' | 'token';

export interface FormatterOptions extends HunkOptions {
  granularity?: Granularity;
}

export interface FormatterData {
  granularity: Granularity;
}

export interface InlineData< T extends TokenMeta = {} > extends FormatterData {
  lines: LineScript< T >[];
}

export interface Formatter< T extends FormatterData > {
  format ( result: Result ) : T;
}
