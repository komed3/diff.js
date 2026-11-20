export interface Token < T extends Record< string, unknown > = {} > {
  readonly value: string;
  readonly start: number;
  readonly end: number;
  readonly type: string;
  readonly metadata?: T;
}
