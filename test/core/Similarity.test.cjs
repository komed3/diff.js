const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );


const { Myers } = require( '../../.test-dist/algorithms/Myers.js' );
const { Engine } = require( '../../.test-dist/core/Engine.js' );
const { Similarity } = require( '../../.test-dist/core/Similarity.js' );
const { Character } = require( '../../.test-dist/tokenizers/Character.js' );


const algorithm = new Myers();
const engine = ( options ) => new Engine( { algorithm, ...options } );
const analyze = ( original, modified, options = {} ) => new Similarity(
  engine( options ).process( { original, modified } ), options
);


test( 'Similarity', async t => {
  await t.test( 'returns null for changed lines without a tokenizer', () => {
    const similarity = analyze( 'same\nold', 'same\nnew' );

    assert.equal( similarity.get(), null );
    assert.deepEqual( similarity.lines(), [ {
      original: 0, modified: 0, type: 'equal', originalLength: 4, modifiedLength: 4,
      commonLength: 4, retention: 1, similarity: 1, combined: 1
    }, {
      original: 1, modified: 1, type: 'change', originalLength: 3, modifiedLength: 3,
      commonLength: null, retention: null, similarity: null, combined: null
    } ] );
  } );
} );
