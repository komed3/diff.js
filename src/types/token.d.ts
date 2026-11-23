export type TokenMeta = Record< string, unknown >;

export type Token< T extends TokenMeta = {} > = T & {
  readonly type: string;
  readonly value: string;
  readonly start: number;
  readonly end: number;
};
