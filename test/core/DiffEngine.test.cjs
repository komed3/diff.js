const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );

const { DiffEngine } = require( '../../.test-dist/DiffEngine.js' );
const { MyersAlgorithm } = require( '../../.test-dist/algorithms/MyersAlgorithm.js' );
const { CharacterTokenizer } = require( '../../.test-dist/tokenizers/CharacterTokenizer.js' );
const { CustomTokenizer } = require( '../../.test-dist/tokenizers/CustomTokenizer.js' );
