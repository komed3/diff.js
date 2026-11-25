import type { LineScript } from './engine';
import type { Range } from './operation';


export interface HunkOptions {
  context?: number;
}

export interface HunkData {
  readonly original: Range;
  readonly modified: Range;
  readonly lines: readonly LineScript[];
}
