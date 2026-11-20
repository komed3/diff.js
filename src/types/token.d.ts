export type Token< T extends Record< string, unknown > = {} > = T & {
  readonly type: string;
  readonly value: string;
  readonly start: number;
  readonly end: number;
};
