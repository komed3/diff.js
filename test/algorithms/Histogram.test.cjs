const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );

const { Histogram } = require( '../../.test-dist/algorithms/Histogram.js' );
const { diff, reconstruct, getOperationCount, getEqualLength, createSequences, equals } = require( '../utils.cjs' );


const algorithm = new Histogram();
const d = ( o, m ) => diff( o, m, algorithm );


test( 'Histogram', async t => {
  await t.test( 'handles two empty sequences', () => {
    assert.deepEqual( d( [], [] ), [] );
  } );

  await t.test( 'handles an empty original sequence', () => {
    const original = [], modified = [ 'a', 'b', 'c' ];
    const operations = d( original, modified );

    assert.deepEqual( operations, [
      { type: 'insert', original: { start: 0, length: 0 }, modified: { start: 0, length: 3 } }
    ] );

    reconstruct( original, modified, operations );
  } );

  await t.test( 'handles an empty modified sequence', () => {
    const original = [ 'a', 'b', 'c' ], modified = [];
    const operations = d( original, modified );

    assert.deepEqual( operations, [
      { type: 'delete', original: { start: 0, length: 3 }, modified: { start: 0, length: 0 } }
    ] );

    reconstruct( original, modified, operations );
  } );

  await t.test( 'handles identical sequences', () => {
    const original = [ 'a', 'b', 'c' ], modified = [ 'a', 'b', 'c' ];
    const operations = d( original, modified );

    assert.deepEqual( operations, [
      { type: 'equal', original: { start: 0, length: 3 }, modified: { start: 0, length: 3 } }
    ] );

    reconstruct( original, modified, operations );
  } );

  await t.test( 'uses repeated elements as anchors', () => {
    const original = [ 'a', 'a', 'b', 'b', 'c' ], modified = [ 'a', 'b', 'b', 'c', 'c' ];
    const operations = d( original, modified );

    reconstruct( original, modified, operations );
    assert.equal( getEqualLength( operations ), 4 );
  } );

  await t.test( 'prefers rarer common elements', () => {
    const original = [ 'a', 'a', 'a', 'b', 'c' ], modified = [ 'a', 'a', 'b', 'c', 'c' ];
    const operations = d( original, modified );

    reconstruct( original, modified, operations );
    assert.equal( getEqualLength( operations ), 4 );
  } );

  await t.test( 'uses Myers for regions without common elements', () => {
    const original = [ 'a', 'b' ], modified = [ 'c', 'd' ];
    const operations = d( original, modified );

    reconstruct( original, modified, operations );
    assert.equal( getOperationCount( operations, 'delete' ), 1 );
    assert.equal( getOperationCount( operations, 'insert' ), 1 );
  } );

  await t.test( 'uses the supplied equality function', () => {
    const original = [ 'Alpha', 'Beta' ], modified = [ 'alpha', 'BETA' ];
    const compare = ( a, b ) => a.toLowerCase() === b.toLowerCase();
    const operations = algorithm.diff( original, modified, compare );

    assert.deepEqual( operations, [
      { type: 'equal', original: { start: 0, length: 2 }, modified: { start: 0, length: 2 } }
    ] );

    reconstruct( original, modified, operations, compare );
  } );

  await t.test( 'uses the supplied key function', () => {
    const algorithm = new Histogram( { getKey: value => value.toLowerCase() } );
    const original = [ 'Alpha', 'Alpha', 'Beta' ], modified = [ 'alpha', 'beta', 'BETA' ];
    const compare = ( a, b ) => a.toLowerCase() === b.toLowerCase();
    const operations = algorithm.diff( original, modified, compare );

    reconstruct( original, modified, operations, compare );
    assert.equal( getEqualLength( operations ), 2 );
  } );

  await t.test( 'handles key collisions without treating unequal elements as equal', () => {
    const algorithm = new Histogram( { getKey: () => 'same' } );
    const original = [ 'a', 'b', 'c' ], modified = [ 'a', 'x', 'c' ];
    const operations = algorithm.diff( original, modified, equals );

    reconstruct( original, modified, operations );
    assert.equal( getEqualLength( operations ), 2 );
  } );

  await t.test( 'does not modify input sequences', () => {
    const original = [ 'a', 'b', 'b', 'c' ], modified = [ 'a', 'b', 'c', 'c' ];
    const originalCopy = [ ...original ], modifiedCopy = [ ...modified ];

    d( original, modified );
    assert.deepEqual( original, originalCopy );
    assert.deepEqual( modified, modifiedCopy );
  } );

  await t.test( 'produces deterministic results', () => {
    const original = [ 'a', 'a', 'b', 'b', 'c' ], modified = [ 'a', 'b', 'b', 'c', 'c' ];

    assert.deepEqual( d( original, modified ), d( original, modified ) );
  } );

  await t.test( 'produces valid edit scripts for short sequences', () => {
    const sequences = createSequences();

    for ( const original of sequences ) for ( const modified of sequences )
      reconstruct( original, modified, d( original, modified ) );
  } );

  await t.test( 'produces valid edit scripts with key indexing', () => {
    const algorithm = new Histogram( { getKey: value => value } );
    const sequences = createSequences();

    for ( const original of sequences ) for ( const modified of sequences )
      reconstruct( original, modified, algorithm.diff( original, modified, equals ) );
  } );
} );
