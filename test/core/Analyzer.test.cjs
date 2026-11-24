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

  await t.test( 'calculates character metrics across encodings', () => {
    const stats = analyze( 'a\n😀', 'a\n😃' ).characters();

    assert.deepEqual( stats.utf16CodeUnits, {
      original: 4, modified: 4, equal: { original: 2, modified: 2 },
      inserted: 0, deleted: 0, changed: { original: 2, modified: 2 },
      delta: 0, changeRate: 0.5
    } );

    assert.deepEqual( stats.unicodeCodePoints, {
      original: 3, modified: 3, equal: { original: 2, modified: 2 },
      inserted: 0, deleted: 0, changed: { original: 1, modified: 1 },
      delta: 0, changeRate: 1 / 3
    } );

    assert.deepEqual( stats.utf8Bytes, {
      original: 6, modified: 6, equal: { original: 2, modified: 2 },
      inserted: 0, deleted: 0, changed: { original: 4, modified: 4 },
      delta: 0, changeRate: 2 / 3
    } );
  } );

  await t.test( 'calculates token metrics and contiguous blocks', () => {
    const stats = analyze( 'hello world', 'hello there', { tokenizer: new Word() } ).tokens();

    assert.deepEqual( stats, {
      lines: 1, original: 3, modified: 3, equal: 2, inserted: 0, deleted: 0,
      changed: { original: 1, modified: 1 }, delta: 0, changeRate: 1 / 3,
      coverage: 1, blocks: 1, largestBlock: 1, averageBlockSize: 1
    } );
  } );

  await t.test( 'groups line operations into blocks', () => {
    const blocks = analyze( 'one\nold', 'one\nnew\nadded' ).blocks();

    assert.deepEqual( blocks, [ {
      type: 'mixed', original: { start: 1, length: 1 }, modified: { start: 1, length: 2 },
      insert: 1, delete: 0, change: 1, size: 2, churn: 3
    } ] );
  } );
} );
