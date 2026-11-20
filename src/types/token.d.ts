export type TokenMeta = Record< string, unknown >;

export interface Token< T extends TokenMeta = {} > {
  readonly value: string;
  readonly start: number;
  readonly end: number;
  readonly type: string;
  readonly metadata?: T;
}
