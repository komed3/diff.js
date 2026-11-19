export interface DiffToken {
  readonly type: string;
  readonly value: string;
  readonly start: number;
  readonly end: number;
}
