const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );

const { DiffAnalyzer } = require( '../../.test-dist/core/DiffAnalyzer.js' );
const { DiffEngine } = require( '../../.test-dist/core/DiffEngine.js' );
const { MyersAlgorithm } = require( '../../.test-dist/algorithms/MyersAlgorithm.js' );
const { CharacterTokenizer } = require( '../../.test-dist/tokenizers/CharacterTokenizer.js' );
