import { Diff } from './Diff';
import { Histogram } from './algorithms/Histogram';
import { HuntSzymanski } from './algorithms/HuntSzymanski';
import { LCS } from './algorithms/LCS';
import { Myers } from './algorithms/Myers';
import { Patience } from './algorithms/Patience';


export const diffJs = {
  Diff,
  algorithm: { Myers, LCS, HuntSzymanski, Histogram, Patience }
};

export default diffJs;
