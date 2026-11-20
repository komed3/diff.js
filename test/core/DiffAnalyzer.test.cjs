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

  await t.test( 'calculates character statistics', () => {
    const stats = createAnalyzer( 'cat', 'cut!' ).getCharacterStats();

    assert.deepEqual( stats.utf16CodeUnits, {
      original: 3, modified: 4, equal: 2, inserted: 2, deleted: 1, changed: 3, delta: 1,
      changeRate: 3 / 7, insertionRate: 0.5, deletionRate: 1 / 3, retentionRate: 2 / 3,
      similarity: 4 / 7, growthRate: 1 / 3, sizeRatio: 4 / 3
    } );

    assert.deepEqual( stats.unicodeCodePoints, stats.utf16CodeUnits );
    assert.deepEqual( stats.utf8Bytes, stats.utf16CodeUnits );
  } );

  await t.test( 'distinguishes UTF-16 units, Unicode codepoints and UTF-8 bytes', () => {
    const stats = createAnalyzer( 'A😀', 'A😃!' ).getCharacterStats();

    assert.equal( stats.utf16CodeUnits.original, 3 );
    assert.equal( stats.utf16CodeUnits.modified, 4 );
    assert.equal( stats.utf16CodeUnits.equal, 1 );
    assert.equal( stats.utf16CodeUnits.inserted, 3 );
    assert.equal( stats.utf16CodeUnits.deleted, 2 );

    assert.equal( stats.unicodeCodePoints.original, 2 );
    assert.equal( stats.unicodeCodePoints.modified, 3 );
    assert.equal( stats.unicodeCodePoints.equal, 1 );
    assert.equal( stats.unicodeCodePoints.inserted, 2 );
    assert.equal( stats.unicodeCodePoints.deleted, 1 );

    assert.equal( stats.utf8Bytes.original, 5 );
    assert.equal( stats.utf8Bytes.modified, 6 );
    assert.equal( stats.utf8Bytes.equal, 1 );
    assert.equal( stats.utf8Bytes.inserted, 5 );
    assert.equal( stats.utf8Bytes.deleted, 4 );
  } );

  await t.test( 'calculates operation statistics', () => {
    const stats = createAnalyzer( 'abc', 'axc' ).getOperationStats();

    assert.deepEqual( stats, {
      total: 4, equal: 2, insert: 1, delete: 1, changes: 2, changeBlocks: 1, insertionBlocks: 1,
      deletionBlocks: 1, replacementBlocks: 1, insertionOnlyBlocks: 0, deletionOnlyBlocks: 0
    } );
  } );

  await t.test( 'distinguishes multiple change blocks', () => {
    const stats = createAnalyzer( 'abcde', 'axcye' ).getOperationStats();

    assert.equal( stats.changeBlocks, 2 );
    assert.equal( stats.insertionBlocks, 2 );
    assert.equal( stats.deletionBlocks, 2 );
    assert.equal( stats.replacementBlocks, 2 );
    assert.equal( stats.insertionOnlyBlocks, 0 );
    assert.equal( stats.deletionOnlyBlocks, 0 );
  } );
} );
