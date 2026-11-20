const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );

const { Analyzer } = require( '../../.test-dist/core/Analyzer.js' );
const { Engine } = require( '../../.test-dist/core/Engine.js' );
const { MyersAlgorithm } = require( '../../.test-dist/algorithms/MyersAlgorithm.js' );
const { CharacterTokenizer } = require( '../../.test-dist/tokenizers/CharacterTokenizer.js' );


const createAnalyzer = ( original, modified ) => {
  const engine = new Engine( new CharacterTokenizer(), new MyersAlgorithm() );
  return new Analyzer( engine.diff( original, modified ) );
};


test( 'Analyzer', async t => {
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

  await t.test( 'identifies insertion-only and deletion-only blocks', () => {
    const insertion = createAnalyzer( 'abc', 'abc!' ).getOperationStats();

    assert.equal( insertion.changeBlocks, 1 );
    assert.equal( insertion.insertionBlocks, 1 );
    assert.equal( insertion.deletionBlocks, 0 );
    assert.equal( insertion.replacementBlocks, 0 );
    assert.equal( insertion.insertionOnlyBlocks, 1 );
    assert.equal( insertion.deletionOnlyBlocks, 0 );

    const deletion = createAnalyzer( 'abc!', 'abc' ).getOperationStats();

    assert.equal( deletion.changeBlocks, 1 );
    assert.equal( deletion.insertionBlocks, 0 );
    assert.equal( deletion.deletionBlocks, 1 );
    assert.equal( deletion.replacementBlocks, 0 );
    assert.equal( deletion.insertionOnlyBlocks, 0 );
    assert.equal( deletion.deletionOnlyBlocks, 1 );
  } );

  await t.test( 'handles identical empty texts', () => {
    const analyzer = createAnalyzer( '', '' );
    const tokens = analyzer.getTokenStats();
    const characters = analyzer.getCharacterStats();
    const operations = analyzer.getOperationStats();

    assert.equal( tokens.original, 0 );
    assert.equal( tokens.modified, 0 );
    assert.equal( tokens.similarity, 1 );
    assert.equal( tokens.changeRate, 0 );
    assert.equal( tokens.growthRate, null );
    assert.equal( tokens.sizeRatio, null );

    for ( const stats of Object.values( characters ) ) {
      assert.equal( stats.original, 0 );
      assert.equal( stats.modified, 0 );
      assert.equal( stats.similarity, 1 );
      assert.equal( stats.growthRate, null );
      assert.equal( stats.sizeRatio, null );
    }

    assert.equal( operations.total, 0 );
    assert.equal( operations.changeBlocks, 0 );
  } );

  await t.test( 'handles pure insertions and deletions', () => {
    const insertion = createAnalyzer( '', 'abc' ).getTokenStats();

    assert.equal( insertion.inserted, 3 );
    assert.equal( insertion.deleted, 0 );
    assert.equal( insertion.insertionRate, 1 );
    assert.equal( insertion.deletionRate, 0 );
    assert.equal( insertion.retentionRate, 0 );
    assert.equal( insertion.growthRate, null );
    assert.equal( insertion.sizeRatio, null );

    const deletion = createAnalyzer( 'abc', '' ).getTokenStats();

    assert.equal( deletion.inserted, 0 );
    assert.equal( deletion.deleted, 3 );
    assert.equal( deletion.insertionRate, 0 );
    assert.equal( deletion.deletionRate, 1 );
    assert.equal( deletion.retentionRate, 0 );
    assert.equal( deletion.growthRate, -1 );
    assert.equal( deletion.sizeRatio, 0 );
  } );

  await t.test( 'reuses cached statistics', () => {
    const analyzer = createAnalyzer( 'original', 'modified' );

    assert.strictEqual( analyzer.getTokenStats(), analyzer.getTokenStats() );
    assert.strictEqual( analyzer.getCharacterStats(), analyzer.getCharacterStats() );
    assert.strictEqual( analyzer.getOperationStats(), analyzer.getOperationStats() );
  } );
} );
