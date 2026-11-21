const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );

const { LCS } = require( '../../.test-dist/algorithms/LCS.js' );
const { diff, reconstruct, editDistance, getEditDistance } = require( '../utils.cjs' );


const algorithm = new LCS();
const d = ( o, m ) => diff( o, m, algorithm );


test( 'LCS', async t => {
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

  await t.test( 'detects an insertion at the beginning', () => {
    const original = [ 'b', 'c' ], modified = [ 'a', 'b', 'c' ];
    const operations = d( original, modified );

    assert.deepEqual( operations, [
      { type: 'insert', original: { start: 0, length: 0 }, modified: { start: 0, length: 1 } },
      { type: 'equal', original: { start: 0, length: 2 }, modified: { start: 1, length: 2 } }
    ] );

    reconstruct( original, modified, operations );
  } );

  await t.test( 'detects an insertion in the middle', () => {
    const original = [ 'a', 'c' ], modified = [ 'a', 'b', 'c' ];
    const operations = d( original, modified );

    assert.deepEqual( operations, [
      { type: 'equal', original: { start: 0, length: 1 }, modified: { start: 0, length: 1 } },
      { type: 'insert', original: { start: 1, length: 0 }, modified: { start: 1, length: 1 } },
      { type: 'equal', original: { start: 1, length: 1 }, modified: { start: 2, length: 1 } }
    ] );

    reconstruct( original, modified, operations );
  } );

  await t.test( 'detects a deletion', () => {
    const original = [ 'a', 'b', 'c' ], modified = [ 'a', 'c' ];
    const operations = d( original, modified );

    assert.deepEqual( operations, [
      { type: 'equal', original: { start: 0, length: 1 }, modified: { start: 0, length: 1 } },
      { type: 'delete', original: { start: 1, length: 1 }, modified: { start: 1, length: 0 } },
      { type: 'equal', original: { start: 2, length: 1 }, modified: { start: 1, length: 1 } }
    ] );

    reconstruct( original, modified, operations );
  } );

  await t.test( 'represents a replacement as delete and insert', () => {
    const original = [ 'a', 'b', 'c' ], modified = [ 'a', 'x', 'c' ];
    const operations = d( original, modified );

    assert.deepEqual( operations, [
      { type: 'equal', original: { start: 0, length: 1 }, modified: { start: 0, length: 1 } },
      { type: 'delete', original: { start: 1, length: 1 }, modified: { start: 1, length: 0 } },
      { type: 'insert', original: { start: 2, length: 0 }, modified: { start: 1, length: 1 } },
      { type: 'equal', original: { start: 2, length: 1 }, modified: { start: 2, length: 1 } }
    ] );

    reconstruct( original, modified, operations );
  } );

  await t.test( 'handles repeated elements without expanding the change', () => {
    const original = [ 'a', 'a', 'a', 'a', 'a', 'a' ], modified = [ 'a', 'a', 'b', 'a', 'a', 'a' ];
    const operations = diff( original, modified );

    assert.equal( operations.filter( ( { type } ) => type === 'insert' ).length, 1 );
    assert.equal( operations.filter( ( { type } ) => type === 'delete' ).length, 1 );
    reconstruct( original, modified, operations );
  } );

  await t.test( 'handles multiple separated changes', () => {
    const original = [ 'a', 'b', 'c', 'd', 'e' ], modified = [ 'a', 'x', 'c', 'y', 'e' ];
    const operations = diff( original, modified );

    assert.equal( operations.filter( ( { type } ) => type === 'equal' ).length, 3 );
    assert.equal( operations.filter( ( { type } ) => type === 'insert' ).length, 2 );
    assert.equal( operations.filter( ( { type } ) => type === 'delete' ).length, 2 );
    reconstruct( original, modified, operations );
  } );

  await t.test( 'uses the supplied equality function', () => {
    const original = [ 'Alpha', 'Beta' ], modified = [ 'alpha', 'BETA' ];
    const operations = algorithm.diff( original, modified, ( a, b ) => a.toLowerCase() === b.toLowerCase() );

    assert.deepEqual( operations, [
      { type: 'equal', original: { start: 0, length: 2 }, modified: { start: 0, length: 2 } }
    ] );
  } );

  await t.test( 'uses deterministic deletion-first tie-breaking', () => {
    const original = [ 'a', 'b' ], modified = [ 'b', 'a' ];
    const operations = d( original, modified );

    assert.deepEqual( operations, [
      { type: 'delete', original: { start: 0, length: 1 }, modified: { start: 0, length: 0 } },
      { type: 'equal', original: { start: 1, length: 1 }, modified: { start: 0, length: 1 } },
      { type: 'insert', original: { start: 2, length: 0 }, modified: { start: 1, length: 1 } }
    ] );

    reconstruct( original, modified, operations );
  } );

  await t.test( 'does not modify input sequences', () => {
    const original = [ 'a', 'b', 'c' ], modified = [ 'a', 'x', 'c' ];
    const originalCopy = [ ...original ], modifiedCopy = [ ...modified ];

    d( original, modified );
    assert.deepEqual( original, originalCopy );
    assert.deepEqual( modified, modifiedCopy );
  } );

  await t.test( 'produces minimal edit scripts for short sequences', () => {
    const sequences = [ [] ];

    for ( let length = 1; length <= 4; length++ ) for ( let mask = 0; mask < 2 ** length; mask++ )
      sequences.push( Array.from( { length }, ( _, i ) => mask & ( 1 << i ) ? 'b' : 'a' ) );

    for ( const original of sequences ) for ( const modified of sequences ) {
      const operations = d( original, modified );

      reconstruct( original, modified, operations );
      assert.equal( getEditDistance( operations ), editDistance( original, modified ) );
    }
  } );

  await t.test( 'handles large common prefixes and suffixes', () => {
    const original = [ ...Array( 1000 ).fill( 'same' ), 'old', ...Array( 1000 ).fill( 'same' ) ];
    const modified = [ ...Array( 1000 ).fill( 'same' ), 'new', ...Array( 1000 ).fill( 'same' ) ];
    const operations = d( original, modified );

    assert.equal( operations.filter( ( { type } ) => type === 'equal' ).reduce(
      ( length, { original } ) => length + original.length, 0
    ), 2000 );

    reconstruct( original, modified, operations );
  } );
} );
