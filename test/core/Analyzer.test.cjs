const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );


const { Myers } = require( '../../dist/cjs/algorithms/Myers.js' );
const { Analyzer } = require( '../../dist/cjs/core/Analyzer.js' );
const { Engine } = require( '../../dist/cjs/core/Engine.js' );
const { Word } = require( '../../dist/cjs/tokenizers/Word.js' );


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

  await t.test( 'calculates operation statistics', () => {
    const stats = analyze( 'one\nold', 'one\nnew\nadded' ).operations();

    assert.deepEqual( stats, {
      total: 3, equal: 1, insert: 1, delete: 0, change: 1, changes: 2,
      changeBlocks: 1, insertionBlocks: 1, deletionBlocks: 0,
      replacementBlocks: 0, insertionOnlyBlocks: 0, deletionOnlyBlocks: 0,
      changeOnlyBlocks: 0, mixedBlocks: 1
    } );
  } );

  await t.test( 'analyzes operation patterns and recurring sequences', () => {
    const stats = analyze( 'a\nold\nb\nold\nc\nold', 'a\nnew\nb\nnew\nc\nnew' ).patterns();

    assert.deepEqual( stats.runs, [
      { type: 'equal', start: 0, length: 1 }, { type: 'change', start: 1, length: 1 },
      { type: 'equal', start: 2, length: 1 }, { type: 'change', start: 3, length: 1 },
      { type: 'equal', start: 4, length: 1 }, { type: 'change', start: 5, length: 1 }
    ] );

    assert.deepEqual( stats.sequences, [
      { pattern: 'equal>change', length: 2, count: 3 },
      { pattern: 'change>equal', length: 2, count: 2 },
      { pattern: 'change>equal>change', length: 3, count: 2 },
      { pattern: 'equal>change>equal', length: 3, count: 2 }
    ] );

    assert.deepEqual( stats.transitions, { 'equal>change': 3, 'change>equal': 2 } );
    assert.deepEqual( stats.longest, { equal: 1, insert: 0, delete: 0, change: 1 } );
    assert.deepEqual( stats.magnitude.equal, { runs: 3, lines: 3, longest: 1, average: 1 } );
    assert.deepEqual( stats.magnitude.change, { runs: 3, lines: 3, longest: 1, average: 1 } );
  } );

  await t.test( 'counts different line endings', () => {
    const stats = analyze( 'a\r\nb', 'a\nb' ).characters();

    for ( const metric of Object.values( stats ) ) assert.deepEqual( metric, {
      original: 4, modified: 3, equal: { original: 1, modified: 1 }, inserted: 0, deleted: 0,
      changed: { original: 3, modified: 2 }, delta: -1, changeRate: 5 / 7
    } );
  } );

  await t.test( 'calculates block distribution', () => {
    const original = [
      'header', 'keep', 'old title', 'old detail', 'obsolete',
      'middle', 'gap', 'tail old', 'footer'
    ].join( '\n' );

    const modified = [
      'header', 'keep', 'new title', 'new detail',
      'middle', 'added', 'gap', 'tail new', 'footer'
    ].join( '\n' );

    const stats = analyze( original, modified ).distribution();

    assert.equal( stats.blockCount, 3 );
    assert.equal( stats.largestBlock, 3 );
    assert.equal( stats.averageBlockSize, 5 / 3 );
    assert.equal( stats.concentration, 3 / 5 );

    assert.equal( stats.original.affected, 4 );
    assert.equal( stats.original.density, 4 / 9 );
    assert.equal( stats.original.coverage, 6 / 9 );
    assert.deepEqual( stats.original.gaps, { count: 1, min: 2, max: 2, average: 2 } );

    assert.equal( stats.modified.affected, 4 );
    assert.equal( stats.modified.density, 4 / 9 );
    assert.equal( stats.modified.coverage, 6 / 9 );
    assert.deepEqual( stats.modified.gaps, { count: 2, min: 1, max: 1, average: 1 } );

    assert.deepEqual( stats.byType.mixed, { count: 1, size: 3, churn: 5, largest: 3, average: 3 } );
    assert.deepEqual( stats.byType.insert, { count: 1, size: 1, churn: 1, largest: 1, average: 1 } );
    assert.deepEqual( stats.byType.change, { count: 1, size: 1, churn: 2, largest: 1, average: 1 } );
  } );

  await t.test( 'handles empty input', () => {
    const analyzer = analyze( '', '' ), dist = analyzer.distribution();

    assert.deepEqual( analyzer.blocks(), [] );
    assert.equal( analyzer.operations().changes, 0 );
    assert.equal( analyzer.tokens().coverage, 0 );

    assert.equal( dist.blockCount, 0 );
    assert.equal( dist.averageBlockSize, 0 );
    assert.equal( dist.largestBlock, 0 );
    assert.equal( dist.concentration, 0 );
  } );
} );
