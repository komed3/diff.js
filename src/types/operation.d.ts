export interface Range {
  readonly start: number;
  readonly length: number;
}

export interface Equal {
  readonly type: 'equal';
  readonly original: Range;
  readonly modified: Range;
}

export interface Insert {
  readonly type: 'insert';
  readonly original: Range & { readonly length: 0 };
  readonly modified: Range;
}

export interface Delete {
  readonly type: 'delete';
  readonly original: Range;
  readonly modified: Range & { readonly length: 0 };
}

export type Operation = Equal | Insert | Delete;
