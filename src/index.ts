import { Diff } from './Diff';

import { Analyzer } from './core/Analyzer';
import { COMPARATORS, createComparator } from './core/Comparator';
import { Engine } from './core/Engine';
import { Heatmap } from './core/Heatmap';
import { Hunk } from './core/Hunk';
import { LineParser } from './core/LineParser';
import { Magnitude } from './core/Magnitude';
import { Similarity } from './core/Similarity';

import { Histogram } from './algorithms/Histogram';
import { HuntSzymanski } from './algorithms/HuntSzymanski';
import { LCS } from './algorithms/LCS';
import { Myers } from './algorithms/Myers';
import { Patience } from './algorithms/Patience';


import { ASCII } from './renderer/ASCII';
import { CLI } from './renderer/CLI';
import { HTML } from './renderer/HTML';
import { Markdown } from './renderer/Markdown';


export {
  Analyzer, ASCII, CLI, COMPARATORS, createComparator, Diff, Engine,
  Heatmap, Histogram, HTML, Hunk, HuntSzymanski, LCS, LineParser, Magnitude,
  Markdown, Myers, Patience, Similarity
};


export const diffJs = {
  Analyzer, ASCII, CLI, COMPARATORS, createComparator, Diff, Engine,
  Heatmap, Histogram, HTML, Hunk, HuntSzymanski, LCS, LineParser, Magnitude,
  Markdown, Myers, Patience, Similarity
};

export default diffJs;
