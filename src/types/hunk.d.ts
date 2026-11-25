import type { LineScript } from './engine';
import type { Range } from './operation';


export interface HunkOptions {
  context?: number;
}

export interface HunkHeader {
  readonly original: Range;
  readonly modified: Range;
}

export interface HunkData {
  readonly original: Range;
  readonly modified: Range;
  readonly header: HunkHeader;
  readonly lines: readonly LineScript[];
}
