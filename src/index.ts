import { Diff } from './Diff';
import { Histogram } from './algorithms/Histogram';
import { HuntSzymanski } from './algorithms/HuntSzymanski';
import { LCS } from './algorithms/LCS';
import { Myers } from './algorithms/Myers';
import { Patience } from './algorithms/Patience';
import { Analyzer } from './core/Analyzer';
import { COMPARATORS, createComparator } from './core/Comparator';
import { Engine } from './core/Engine';
import { Heatmap } from './core/Heatmap';
import { Hunk } from './core/Hunk';
import { LineParser } from './core/LineParser';
import { Magnitude } from './core/Magnitude';
import { Similarity } from './core/Similarity';


export {
  Analyzer, COMPARATORS, createComparator, Diff, Engine, Heatmap, Histogram, Hunk,
  HuntSzymanski, LCS, LineParser, Magnitude, Myers, Patience, Similarity
};


export const diffJs = {
  Analyzer, COMPARATORS, createComparator, Diff, Engine, Heatmap, Histogram, Hunk,
  HuntSzymanski, LCS, LineParser, Magnitude, Myers, Patience, Similarity
};

export default diffJs;
