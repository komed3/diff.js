const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );

const { Magnitude } = require( '../../.test-dist/core/Magnitude.js' );


const createMagnitude = ( stats = {} ) => new Magnitude( {
  original: 10, modified: 14, equal: 8, inserted: 6, deleted: 2, changed: 8, delta: 4,
  changeRate: 1 / 3, insertionRate: 6 / 14, deletionRate: 0.2, retentionRate: 0.8,
  similarity: 2 / 3, growthRate: 0.4, sizeRatio: 1.4, ...stats
} );


test( 'Magnitude', async t => {
  await t.test( 'calculates absolute magnitudes', () => {
    const magnitude = createMagnitude();

    assert.deepEqual( magnitude.absolute(), { value: 8, baseValue: 10, magnitude: 8 } );
    assert.deepEqual( magnitude.absolute( { metric: 'delta' } ), { value: 4, baseValue: 10, magnitude: 4 } );
    assert.deepEqual( magnitude.absolute( { metric: 'delta', base: 'modified' } ), { value: 4, baseValue: 14, magnitude: 4 } );
    assert.deepEqual( magnitude.absolute( { metric: 'delta', base: 20 } ), { value: 4, baseValue: 20, magnitude: 4 } );
  } );

  await t.test( 'calculates relative magnitudes', () => {
    const magnitude = createMagnitude();

    assert.deepEqual( magnitude.relative(), { value: 8, baseValue: 10, ratio: 0.8 } );
    assert.equal( magnitude.relative( { base: 'modified' } ).ratio, 8 / 14 );
    assert.equal( magnitude.relative( { base: 'combined' } ).ratio, 8 / 24 );
    assert.equal( magnitude.relative( { base: 'maximum' } ).ratio, 8 / 14 );
    assert.equal( magnitude.relative( { base: 20 } ).ratio, 0.4 );
  } );

  await t.test( 'calculates percentages', () => {
    const magnitude = createMagnitude();

    assert.deepEqual( magnitude.percentage(), { value: 8, baseValue: 10, percentage: 80 } );
    assert.equal( magnitude.percentage( { precision: 0 } ).percentage, 80 );
    assert.equal( magnitude.percentage( { precision: 2 } ).percentage, 80 );
    assert.equal( magnitude.percentage( { base: 'modified' } ).percentage, 57.1 );
    assert.equal( magnitude.percentage( { base: 20 } ).percentage, 40 );
    assert.equal( magnitude.percentage( { metric: 'delta', base: 20 } ).percentage, 20 );
  } );

  await t.test( 'applies percentage precision', () => {
    const magnitude = createMagnitude();

    assert.equal( magnitude.percentage( { base: 'combined', precision: 0 } ).percentage, 33 );
    assert.equal( magnitude.percentage( { base: 'combined', precision: 1 } ).percentage, 33.3 );
    assert.equal( magnitude.percentage( { base: 'combined', precision: 2 } ).percentage, 33.33 );
  } );

  await t.test( 'calculates boxes', () => {
    const magnitude = createMagnitude();

    assert.deepEqual( magnitude.boxes(), { value: 8, baseValue: 10, filled: 8, empty: 2, total: 10 } );
    assert.deepEqual( magnitude.boxes( { total: 20 } ), { value: 8, baseValue: 10, filled: 16, empty: 4, total: 20 } );
    assert.deepEqual( magnitude.boxes( { total: 5 } ), { value: 8, baseValue: 10, filled: 4, empty: 1, total: 5 } );
  } );

  await t.test( 'rounds and limits box counts', () => {
    const magnitude = createMagnitude();

    assert.equal( magnitude.boxes( { base: 24, total: 10 } ).filled, 3 );
    assert.equal( magnitude.boxes( { base: 4, total: 10 } ).filled, 10 );
    assert.equal( magnitude.boxes( { base: 4, total: 10 } ).empty, 0 );
  } );
} );
