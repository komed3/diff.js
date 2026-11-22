import type { Operation } from './operation';


export interface DiffContext {
    prefix: number;
    suffix: number;
    oStart: number;
    oEnd: number;
    mStart: number;
    mEnd: number;
    oLen: number;
    mLen: number;
    pushEdit: ( type: 0 | 1 | 2 ) => 0 | 1 | 2;
    finish: () => Operation[];
}
