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
  await t.test( 'calculates changed-line similarity from token edits', () => {
    const similarity = analyze( 'kitten', 'sitting', { tokenizer: new Character() } );
    const [ line ] = similarity.lines();

    assert.equal( line.commonLength, 4 );
    assert.equal( line.retention, 4 / 6 );
    assert.equal( line.similarity, 4 / 7 );
    assert.equal( line.combined, ( 4 / 6 + 4 / 7 ) / 2 );
    assert.equal( similarity.get(), 4 / 7 );
  } );

  await t.test( 'weights character similarity by lengths and line similarity by lines', () => {
    const original = 'unchanged line\nabc', modified = 'unchanged line\nabXY';
    const characters = analyze( original, modified, { tokenizer: new Character() } );
    const lines = analyze( original, modified, { tokenizer: new Character(), weighting: 'lines' } );

    assert.equal( characters.get(), ( 'unchanged line'.length + 2 ) / ( 'unchanged line'.length + 4 ) );
    assert.equal( lines.get(), 0.75 );
  } );

  await t.test( 'scores identical empty input as fully similar', () => {
    const similarity = analyze( '', '' );

    assert.deepEqual( similarity.lines(), [] );
    assert.equal( similarity.get(), 1 );
  } );

  await t.test( 'counts Unicode grapheme clusters', () => {
    const family = '👨‍👩‍👧‍👦';
    const similarity = analyze( `${ family }a`, `${ family }b`, { tokenizer: new Character() } );
    const [ line ] = similarity.lines();

    assert.equal( line.originalLength, 2 );
    assert.equal( line.modifiedLength, 2 );
    assert.equal( line.commonLength, 1 );
    assert.equal( line.retention, 0.5 );
    assert.equal( line.similarity, 0.5 );
  } );

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
