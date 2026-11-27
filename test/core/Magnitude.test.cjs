const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );


const { Myers } = require( '../../dist/algorithms/Myers.js' );
const { Engine } = require( '../../dist/core/Engine.js' );
const { Hunk } = require( '../../dist/core/Hunk.js' );
const { Magnitude } = require( '../../dist/core/Magnitude.js' );


const engine = new Engine( { algorithm: new Myers() } );
const analyze = ( original, modified, context = 1 ) => {
  const result = engine.process( { original, modified } );
  return new Hunk( { context } ).create( result ).map( hunk => new Magnitude( hunk ) );
};


test( 'Magnitude', async t => {
  await t.test( 'calculates absolute magnitude per hunk', () => {
    const [ magnitude ] = analyze( 'a\nold\nremoved\nb\n', 'a\nnew\nb\nadded\n' );

    assert.deepEqual( magnitude.absolute(), { value: 1, baseValue: 4, magnitude: 1 } );
    assert.deepEqual( magnitude.absolute( { metric: 'delta' } ), { value: 0, baseValue: 4, magnitude: 0 } );
  } );

  await t.test( 'calculates relative magnitude with different bases', () => {
    const [ magnitude ] = analyze( 'a\nold\nremoved\nb\n', 'a\nnew\nb\nadded\n' );

    assert.deepEqual( magnitude.relative( { metric: 'inserted', base: 'modified' } ), { value: 1, baseValue: 4, ratio: 0.25 } );
    assert.deepEqual( magnitude.relative( { metric: 'deleted', base: 'combined' } ), { value: 1, baseValue: 8, ratio: 0.125 } );
  } );

  await t.test( 'calculates percentages with configurable precision', () => {
    const [ magnitude ] = analyze( 'a\nold\nremoved\nb\n', 'a\nnew\nb\nadded\n' );

    assert.deepEqual( magnitude.percentage(), { value: 1, baseValue: 4, percentage: 25 } );
    assert.deepEqual( magnitude.percentage( { metric: 'inserted', precision: 0 } ), { value: 1, baseValue: 4, percentage: 25 } );
  } );

  await t.test( 'calculates box magnitude and operation counts', () => {
    const [ magnitude ] = analyze( 'a\nold\nremoved\nb\n', 'a\nnew\nb\nadded\n' );

    assert.deepEqual( magnitude.boxes( { total: 8 } ), {
      value: 1, baseValue: 4, insert: 1, delete: 1, change: 1, filled: 2, empty: 6, total: 8
    } );
  } );

  await t.test( 'ignores context lines when counting operations', () => {
    const [ magnitude ] = analyze( 'a\nold\nb', 'a\nnew\nb' );

    assert.deepEqual( magnitude.boxes(), {
      value: 1, baseValue: 3, insert: 0, delete: 0, change: 1, filled: 2, empty: 3, total: 5
    } );
  } );

  await t.test( 'calculates separate magnitudes for separate hunks', () => {
    const magnitudes = analyze( 'a\nold\nb\nc\nremoved\nd', 'a\nnew\nb\nc\nadded\nd', 0 );

    assert.equal( magnitudes.length, 2 );

    assert.deepEqual( magnitudes[ 0 ].boxes(), {
      value: 1, baseValue: 1, insert: 0, delete: 0, change: 1, filled: 5, empty: 0, total: 5
    } );

    assert.deepEqual( magnitudes[ 1 ].boxes(), {
      value: 1, baseValue: 1, insert: 0, delete: 0, change: 1, filled: 5, empty: 0, total: 5
    } );
  } );

  await t.test( 'handles empty input and zero bases', () => {
    const [ magnitude ] = [ new Magnitude( null ) ];

    assert.deepEqual( magnitude.relative( { base: 0 } ), { value: 0, baseValue: 0, ratio: null } );
    assert.deepEqual( magnitude.percentage( { base: 0 } ), { value: 0, baseValue: 0, percentage: null } );

    assert.deepEqual( magnitude.boxes( { base: 0 } ), {
      value: 0, baseValue: 0, insert: 0, delete: 0, change: 0, filled: null, empty: null, total: 5
    } );
  } );

  await t.test( 'rejects invalid options', () => {
    const [ magnitude ] = analyze( 'old', 'new' );

    for ( const precision of [ -1, 1.5, 101, NaN, Infinity ] ) assert.throws( () => magnitude.percentage( { precision } ), Error );
    for ( const total of [ 0, -1, 1.5, NaN, Infinity ] ) assert.throws( () => magnitude.boxes( { total } ), Error );
    for ( const base of [ -1, NaN, Infinity, 'invalid' ] ) assert.throws( () => magnitude.relative( { base } ), Error );

    assert.throws( () => magnitude.absolute( { metric: 'invalid' } ), Error );
  } );
} );
