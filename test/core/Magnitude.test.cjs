const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );


const { Myers } = require( '../../.test-dist/algorithms/Myers.js' );
const { Analyzer } = require( '../../.test-dist/core/Analyzer.js' );
const { Engine } = require( '../../.test-dist/core/Engine.js' );
const { Hunk } = require( '../../.test-dist/core/Hunk.js' );
const { Magnitude } = require( '../../.test-dist/core/Magnitude.js' );


const engine = new Engine( { algorithm: new Myers() } );
const analyze = ( original, modified ) => {
  const result = engine.process( { original, modified } );
  const hunks = new Hunk( { context: 1 } ).create( result );

  return new Magnitude( hunks, new Analyzer( result ).lines() );
};


test( 'Magnitude', async t => {
  await t.test( 'calculates absolute magnitude', () => {
    const magnitude = analyze( 'a\nold\nremoved\nb', 'a\nnew\nb\nadded' );

    assert.deepEqual( magnitude.absolute(), { value: 1, baseValue: 4, magnitude: 1 } );
    assert.deepEqual( magnitude.absolute( { metric: 'delta' } ), { value: 0, baseValue: 4, magnitude: 0 } );
  } );

  await t.test( 'calculates relative magnitude with different bases', () => {
    const magnitude = analyze( 'a\nold\nremoved\nb', 'a\nnew\nb\nadded' );

    assert.deepEqual( magnitude.relative( { metric: 'inserted', base: 'modified' } ), { value: 1, baseValue: 4, ratio: 0.25 } );
    assert.deepEqual( magnitude.relative( { metric: 'deleted', base: 'combined' } ), { value: 1, baseValue: 8, ratio: 0.125 } );
  } );

  await t.test( 'calculates percentages with configurable precision', () => {
    const magnitude = analyze( 'a\nold\nremoved\nb', 'a\nnew\nb\nadded' );

    assert.deepEqual( magnitude.percentage(), { value: 1, baseValue: 4, percentage: 25 } );
    assert.deepEqual( magnitude.percentage( { metric: 'inserted', precision: 0 } ), { value: 1, baseValue: 4, percentage: 25 } );
  } );

  await t.test( 'calculates box magnitude and operation counts', () => {
    const magnitude = analyze( 'a\nold\nremoved\nb', 'a\nnew\nb\nadded' );

    assert.deepEqual( magnitude.boxes( { total: 8 } ), {
      value: 1, baseValue: 4, insert: 1, delete: 1, change: 1, filled: 2, empty: 6, total: 8
    } );
  } );

  await t.test( 'ignores context lines when counting operations', () => {
    const magnitude = analyze( 'a\nold\nb', 'a\nnew\nb' );

    assert.deepEqual( magnitude.boxes(), {
      value: 1, baseValue: 3, insert: 0, delete: 0, change: 1, filled: 2, empty: 3, total: 5
    } );
  } );
} );
