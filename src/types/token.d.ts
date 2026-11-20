export type TokenBaseMeta = Record< string, unknown >;

export interface Token< T extends TokenBaseMeta = {} > {
  readonly value: string;
  readonly start: number;
  readonly end: number;
  readonly type: string;
  readonly metadata?: T;
}
