const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );

const { LCS } = require( '../../.test-dist/algorithms/LCS.js' );
const { diff, reconstruct, editDistance, getEditDistance, equals } = require( '../utils.cjs' );


const algorithm = new LCS();


test( 'LCS', async t => {
  await t.test( 'handles two empty sequences', () => {
    assert.deepEqual( diff( [], [], algorithm ), [] );
  } );

  await t.test( 'handles an empty original sequence', () => {
    const original = [], modified = [ 'a', 'b', 'c' ];
    const operations = diff( original, modified, algorithm );

    assert.deepEqual( operations, [
      { type: 'insert', original: { start: 0, length: 0 }, modified: { start: 0, length: 3 } }
    ] );

    reconstruct( original, modified, operations );
  } );

  await t.test( 'handles an empty modified sequence', () => {
    const original = [ 'a', 'b', 'c' ], modified = [];
    const operations = diff( original, modified, algorithm );

    assert.deepEqual( operations, [
      { type: 'delete', original: { start: 0, length: 3 }, modified: { start: 0, length: 0 } }
    ] );

    reconstruct( original, modified, operations );
  } );

  await t.test( 'handles identical sequences', () => {
    const original = [ 'a', 'b', 'c' ], modified = [ 'a', 'b', 'c' ];
    const operations = diff( original, modified, algorithm );

    assert.deepEqual( operations, [
      { type: 'equal', original: { start: 0, length: 3 }, modified: { start: 0, length: 3 } }
    ] );

    reconstruct( original, modified, operations );
  } );
} );
