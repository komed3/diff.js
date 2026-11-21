const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );

const { Myers } = require( '../../.test-dist/algorithms/Myers.js' );
const { diff, reconstruct, getOperationCount, createSequences, assertMinimal, equals } = require( '../utils.cjs' );


const algorithm = new Myers();
const d = ( o, m ) => diff( o, m, algorithm );


test( 'MyersAlgorithm', async t => {
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
    const operations = d( original, modified );

    assert.equal( getOperationCount( operations, 'insert' ), 1 );
    assert.equal( getOperationCount( operations, 'delete' ), 1 );
    reconstruct( original, modified, operations );
  } );

  await t.test( 'handles multiple separated changes', () => {
    const original = [ 'a', 'b', 'c', 'd', 'e' ], modified = [ 'a', 'x', 'c', 'y', 'e' ];
    const operations = d( original, modified );

    assert.equal( getOperationCount( operations, 'equal' ), 3 );
    assert.equal( getOperationCount( operations, 'insert' ), 2 );
    assert.equal( getOperationCount( operations, 'delete' ), 2 );
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

  await t.test( 'supports minimal mode', () => {
    const algorithm = new Myers( { mode: 'minimal' } );
    const original = [ 'a', 'b', 'c' ], modified = [ 'a', 'x', 'c' ];
    const operations = algorithm.diff( original, modified, equals );

    assert.equal( operations.filter( ( { type } ) => type === 'equal' ).reduce(
      ( sum, { original } ) => sum + original.length, 0
    ), 2 );

    reconstruct( original, modified, operations );
  } );

  await t.test( 'produces minimal edit scripts for short sequences', () => {
    const algorithm = new Myers( { mode: 'minimal' } );
    const sequences = createSequences();

    for ( const original of sequences ) for ( const modified of sequences )
      assertMinimal( original, modified, algorithm.diff( original, modified, equals ) );
  } );

  await t.test( 'bounds fast-mode search and returns a valid fallback', () => {
    const algorithm = new Myers( { mode: 'fast' } );
    const original = Array.from( { length: 2000 }, ( _, i ) => `a${ i }` );
    const modified = Array.from( { length: 2000 }, ( _, i ) => `b${ i }` );
    const operations = algorithm.diff( original, modified, equals );

    assert.deepEqual( operations.map( ( { type } ) => type ), [ 'delete', 'insert' ] );
    reconstruct( original, modified, operations );
  } );
} );
