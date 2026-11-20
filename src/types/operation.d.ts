export interface EditStep {
  readonly type: 'equal' | 'insert' | 'delete';
  readonly original: number;
  readonly modified: number;
}

export interface OperationRange {
  readonly start: number;
  readonly length: number;
}

export interface EqualOperation {
  readonly type: 'equal';
  readonly original: OperationRange;
  readonly modified: OperationRange;
}

export interface InsertOperation {
  readonly type: 'insert';
  readonly original: OperationRange & { readonly length: 0 };
  readonly modified: OperationRange;
}

export interface DeleteOperation {
  readonly type: 'delete';
  readonly original: OperationRange;
  readonly modified: OperationRange & { readonly length: 0 };
}

export type Operation =
  | EqualOperation
  | InsertOperation
  | DeleteOperation;
