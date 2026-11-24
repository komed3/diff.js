const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );


const { Myers } = require( '../../.test-dist/algorithms/Myers.js' );
const { Analyzer } = require( '../../.test-dist/core/Analyzer.js' );
const { Engine } = require( '../../.test-dist/core/Engine.js' );
const { Word } = require( '../../.test-dist/tokenizers/Word.js' );


const algorithm = new Myers();
const engine = ( options ) => new Engine( { algorithm, ...options } );
const analyze = ( original, modified, options ) => new Analyzer(
  engine( options ).process( { original, modified } )
);


test( 'Analyzer', async t => {
  await t.test( 'calculates line metrics', () => {
    const stats = analyze( 'one\nold', 'one\nnew\nadded' ).lines();

    assert.deepEqual( stats, {
      original: 2, modified: 3, equal: 1, inserted: 1, deleted: 0, changed: 1,
      delta: 1, changeRate: 0.6, insertionRate: 1 / 3, deletionRate: 0,
      retentionRate: 0.5, growthRate: 0.5, sizeRatio: 1.5
    } );
  } );
} );
