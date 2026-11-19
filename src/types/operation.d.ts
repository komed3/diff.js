export interface DiffTokenRange {
  readonly start: number;
  readonly length: number;
}

export type DiffOperation = {
  readonly type: 'equal';
  readonly original: DiffTokenRange;
  readonly modified: DiffTokenRange;
} | {
  readonly type: 'insert';
  readonly original: {
    readonly start: number;
    readonly length: 0;
  };
  readonly modified: DiffTokenRange;
} | {
  readonly type: 'delete';
  readonly original: DiffTokenRange;
  readonly modified: {
    readonly start: number;
    readonly length: 0;
  };
};

export type DiffOperationType = DiffOperation[ 'type' ];
