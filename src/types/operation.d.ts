export interface TokenRange {
  readonly start: number;
  readonly length: number;
}

export type Operation = {
  readonly type: 'equal';
  readonly original: TokenRange;
  readonly modified: TokenRange;
} | {
  readonly type: 'insert';
  readonly original: {
    readonly start: number;
    readonly length: 0;
  };
  readonly modified: TokenRange;
} | {
  readonly type: 'delete';
  readonly original: TokenRange;
  readonly modified: {
    readonly start: number;
    readonly length: 0;
  };
};

export type OperationType = Operation[ 'type' ];
