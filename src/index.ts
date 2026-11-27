export type { Algorithm } from './types/algorithm';
export type {
  Block, BlockDistribution, BlockType, CharacterMetric, CharacterStats, DistributionStats,
  MetricStats, OperationStats, PatternMagnitude, PatternRun, PatternSequence, PatternStats,
  PatternType, SideDistribution, TokenStats
} from './types/analyze';
export type { Comparable, Comparator, ComparatorFactory, ComparatorOptions } from './types/comparator';
export type { Sequence } from './types/context';
export type { EditScript, EngineOptions, Input, LineScript, Result } from './types/engine';
export type { Formatter } from './types/formatter';
export type { HeatmapCell, HeatmapData, HeatmapDimension, HeatmapFilter, HeatmapOptions } from './types/heatmap';
export type { HunkData, HunkHeader, HunkOptions } from './types/hunk';
export type { Line } from './types/line';
export type {
  MagnitudeAbsolute, MagnitudeBase, MagnitudeBoxes, MagnitudeBoxesOptions, MagnitudeOptions,
  MagnitudePercentage, MagnitudePercentageOptions, MagnitudeRelative, MagnitudeValue
} from './types/magnitude';
export type { Change, Delete, Equal, Insert, LineOperation, Operation, Range } from './types/operation';
export type { Renderer as Render } from './types/renderer';
export type { SimilarityLine, SimilarityMode, SimilarityOptions, SimilarityWeight } from './types/similarity';
export type { CustomTokenizerOptions, Token, Tokenizer, TokenizerOptions, TokenMeta } from './types/tokenizer';


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
