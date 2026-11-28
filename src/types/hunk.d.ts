import type { LineScript } from './engine';
import type { Range } from './operation';
import type { TokenMeta } from './tokenizer';


export type HunkContext = number | 'all';

export interface HunkOptions {
  context?: HunkContext;
}

export interface HunkHeader {
  readonly original: Range;
  readonly modified: Range;
}

export interface HunkData< T extends TokenMeta = {} > {
  readonly original: Range;
  readonly modified: Range;
  readonly header: HunkHeader;
  readonly lines: readonly LineScript< T >[];
}
