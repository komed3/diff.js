import type { LineScript } from './engine';
import type { Range } from './operation';
import { TokenMeta } from './tokenizer';


export interface HunkOptions {
  context?: number | 'all';
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
