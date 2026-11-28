export type * from './types/algorithm';
export type * from './types/analyze';
export type * from './types/comparator';
export type * from './types/context';
export type * from './types/engine';
export type * from './types/formatter';
export type * from './types/heatmap';
export type * from './types/hunk';
export type * from './types/line';
export type * from './types/magnitude';
export type * from './types/operation';
export type * from './types/renderer';
export type * from './types/similarity';
export type * from './types/tokenizer';


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

import { Character } from './tokenizers/Character';
import { Custom } from './tokenizers/Custom';
import { Word } from './tokenizers/Word';

import { Inline } from './formatters/Inline';
import { SideBySide } from './formatters/SideBySide';
import { Unified } from './formatters/Unified';

import { ASCII } from './renderers/ASCII';
import { CLI } from './renderers/CLI';
import { HTML } from './renderers/HTML';
import { Markdown } from './renderers/Markdown';
import { React } from './renderers/React';

import { Diff } from './Diff';


export {
  Analyzer, ASCII, Character, CLI, COMPARATORS, createComparator,
  Custom, Diff, Engine, Heatmap, Histogram, HTML, Hunk, HuntSzymanski,
  Inline, LCS, LineParser, Magnitude, Markdown, Myers, Patience,
  React, SideBySide, Similarity, Unified, Word
};


export const diffJs = Object.assign( Diff, {
  Analyzer, ASCII, Character, CLI, COMPARATORS, createComparator,
  Custom, Engine, Heatmap, Histogram, HTML, Hunk, HuntSzymanski,
  Inline, LCS, LineParser, Magnitude, Markdown, Myers, Patience,
  React, SideBySide, Similarity, Unified, Word
} );

export default diffJs;
