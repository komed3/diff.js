export interface Group< T > {
  value: T;
}

export interface MatchGroup< T > extends Group< T > {
  m: number[];
}

export interface HistogramGroup< T > extends Group< T > {
  o: number[];
  m: number[];
}

export interface AnchorGroup< T > extends Group< T > {
  o: number;
  m: number;
}
