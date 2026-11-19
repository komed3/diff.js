import type { DiffToken } from './token';


export interface DiffTokenizer< T extends Record< string, unknown > = {} > {
  tokenize ( text: string ) : Array< DiffToken< T > >;
}
