const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );

const { HuntSzymanski } = require( '../../.test-dist/algorithms/HuntSzymanski.js' );
const { diff, reconstruct, getEditDistance, getEqualLength, createSequences, assertMinimal, equals } = require( '../utils.cjs' );


const algorithm = new HuntSzymanski();
const d = ( o, m ) => diff( o, m, algorithm );


test( 'HuntSzymanski', async t => {
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

  await t.test( 'handles repeated elements', () => {
    const original = [ 'a', 'a', 'a', 'a', 'a', 'a' ], modified = [ 'a', 'a', 'b', 'a', 'a', 'a' ];
    const operations = d( original, modified );

    assert.equal( getEditDistance( operations ), 2 );
    reconstruct( original, modified, operations );
  } );

  await t.test( 'handles multiple separated changes', () => {
    const original = [ 'a', 'b', 'c', 'd', 'e' ], modified = [ 'a', 'x', 'c', 'y', 'e' ];
    const operations = d( original, modified );

    assert.equal( getEqualLength( operations ), 3 );
    reconstruct( original, modified, operations );
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
    const algorithm = new HuntSzymanski( { getKey: value => value.toLowerCase() } );
    const original = [ 'Alpha', 'Beta', 'Gamma' ], modified = [ 'alpha', 'BETA', 'delta', 'gamma' ];
    const compare = ( a, b ) => a.toLowerCase() === b.toLowerCase();
    const operations = algorithm.diff( original, modified, compare );

    assert.deepEqual( operations, [
      { type: 'equal', original: { start: 0, length: 2 }, modified: { start: 0, length: 2 } },
      { type: 'insert', original: { start: 2, length: 0 }, modified: { start: 2, length: 1 } },
      { type: 'equal', original: { start: 2, length: 1 }, modified: { start: 3, length: 1 } }
    ] );

    reconstruct( original, modified, operations, compare );
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
    const sequences = createSequences();

    for ( const original of sequences ) for ( const modified of sequences )
      assertMinimal( original, modified, d( original, modified ) );
  } );

  await t.test( 'produces minimal edit scripts with key indexing', () => {
    const algorithm = new HuntSzymanski( { getKey: value => value } );
    const sequences = createSequences();

    for ( const original of sequences ) for ( const modified of sequences )
      assertMinimal( original, modified, algorithm.diff( original, modified, equals ) );
  } );
} );
