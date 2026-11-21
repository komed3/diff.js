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
    const original = [ 'a', 'a', 'b', 'b', 'c' ];
    const modified = [ 'a', 'b', 'b', 'c', 'c' ];
    const operations = d( original, modified );

    reconstruct( original, modified, operations );
    assert.equal( getEqualLength( operations ), 4 );
  } );
} );
