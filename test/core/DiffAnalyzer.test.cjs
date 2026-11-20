const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );

const { DiffAnalyzer } = require( '../../.test-dist/core/DiffAnalyzer.js' );
const { DiffEngine } = require( '../../.test-dist/core/DiffEngine.js' );
const { MyersAlgorithm } = require( '../../.test-dist/algorithms/MyersAlgorithm.js' );
const { CharacterTokenizer } = require( '../../.test-dist/tokenizers/CharacterTokenizer.js' );


const createAnalyzer = ( original, modified ) => {
  const engine = new DiffEngine( new CharacterTokenizer(), new MyersAlgorithm() );
  return new DiffAnalyzer( engine.diff( original, modified ) );
};


test( 'DiffAnalyzer', async t => {
  await t.test( 'calculates token statistics', () => {
    const stats = createAnalyzer( 'cat', 'cut!' ).getTokenStats();

    assert.deepEqual( stats, {
      original: 3, modified: 4, equal: 2, inserted: 2, deleted: 1, changed: 3, delta: 1,
      changeRate: 3 / 7, insertionRate: 0.5, deletionRate: 1 / 3, retentionRate: 2 / 3,
      similarity: 4 / 7, growthRate: 1 / 3, sizeRatio: 4 / 3
    } );
  } );
} );
