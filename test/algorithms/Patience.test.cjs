const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );

const shared = require( './shared.cjs' );
const { diff, reconstruct, getOperationCount, equals } = require( './utils.cjs' );

const { Patience } = require( '../../.test-dist/algorithms/Patience.js' );
const algorithm = new Patience();


shared( 'Patience', algorithm );

test( 'Patience specifics', async t => {
  await t.test( 'detects changes between unique anchors', () => {
    const original = [ 'start', 'old', 'middle', 'old2', 'end' ];
    const modified = [ 'start', 'new', 'middle', 'new2', 'end' ];
    const operations = diff( original, modified, algorithm );

    reconstruct( original, modified, operations );
    assert.equal( getOperationCount( operations, 'equal' ), 3 );
    assert.equal( getOperationCount( operations, 'delete' ), 2 );
    assert.equal( getOperationCount( operations, 'insert' ), 2 );
  } );

  await t.test( 'does not use non-unique elements as anchors', () => {
    const original = [ 'a', 'b', 'b', 'c' ], modified = [ 'a', 'b', 'c' ];
    const operations = diff( original, modified, algorithm );

    reconstruct( original, modified, operations );
    assert.equal( getOperationCount( operations, 'delete' ), 1 );
  } );

  await t.test( 'handles key collisions through equality checks', () => {
    const original = [ 'a', 'b', 'c' ], modified = [ 'a', 'x', 'c' ];
    const operations = algorithm.diff( { original, modified, equals: ( a, b ) => a === b } );

    reconstruct( original, modified, operations, equals );
  } );
} );
