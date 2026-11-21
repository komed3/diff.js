const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );

const { Myers } = require( '../../.test-dist/algorithms/Myers.js' );


const algorithm = new Myers();

const equals = ( a, b ) => a === b;
const diff = ( o, m ) => algorithm.diff( o, m, equals );

const reconstruct = ( o, m, operations ) => {
  const result = operations.map( ( { type, original, modified } ) => {
    if ( type === 'equal' ) {
      assert.equal( original.length, modified.length );
      assert.deepEqual(
        o.slice( original.start, original.start + original.length ),
        m.slice( modified.start, modified.start + modified.length )
      );

      return o.slice( original.start, original.start + original.length );
    }

    if ( type === 'delete' ) {
      assert.equal( modified.length, 0 );
      return [];
    }

    assert.equal( original.length, 0 );
    return m.slice( modified.start, modified.start + modified.length );
  } );

  assert.deepEqual( result.flat(), m );

  let oPos = 0, mPos = 0;

  for ( const { original, modified } of operations ) {
    assert.equal( original.start, oPos );
    assert.equal( modified.start, mPos );

    oPos += original.length, mPos += modified.length;
  }

  assert.equal( oPos, o.length );
  assert.equal( mPos, m.length );
};

const editDistance = ( original, modified ) => {
  const rows = Array.from( { length: original.length + 1 }, () => new Uint32Array( modified.length + 1 ) );

  for ( let i = 0; i <= original.length; i++ ) rows[ i ][ 0 ] = i;
  for ( let i = 0; i <= modified.length; i++ ) rows[ 0 ][ i ] = i;

  for ( let i = 1; i <= original.length; i++ ) for ( let j = 1; j <= modified.length; j++ )
    rows[ i ][ j ] = original[ i - 1 ] === modified[ j - 1 ] ? rows[ i - 1 ][ j - 1 ] :
      Math.min( rows[ i - 1 ][ j ] + 1, rows[ i ][ j - 1 ] + 1 );

  return rows[ original.length ][ modified.length ];
};

const getEditDistance = ( operations ) => operations.reduce( ( d, { type, original, modified } ) =>
  d + ( type === 'equal' ? 0 : original.length + modified.length ), 0
);


test( 'MyersAlgorithm', async t => {
  await t.test( 'handles two empty sequences', () => {
    assert.deepEqual( diff( [], [] ), [] );
  } );

  await t.test( 'handles an empty original sequence', () => {
    const original = [], modified = [ 'a', 'b', 'c' ];
    const operations = diff( original, modified );

    assert.deepEqual( operations, [
      { type: 'insert', original: { start: 0, length: 0 }, modified: { start: 0, length: 3 } }
    ] );

    reconstruct( original, modified, operations );
  } );

  await t.test( 'handles an empty modified sequence', () => {
    const original = [ 'a', 'b', 'c' ], modified = [];
    const operations = diff( original, modified );

    assert.deepEqual( operations, [
      { type: 'delete', original: { start: 0, length: 3 }, modified: { start: 0, length: 0 } }
    ] );

    reconstruct( original, modified, operations );
  } );

  await t.test( 'handles identical sequences', () => {
    const original = [ 'a', 'b', 'c' ], modified = [ 'a', 'b', 'c' ];
    const operations = diff( original, modified );

    assert.deepEqual( operations, [
      { type: 'equal', original: { start: 0, length: 3 }, modified: { start: 0, length: 3 } }
    ] );

    reconstruct( original, modified, operations );
  } );

  await t.test( 'detects an insertion at the beginning', () => {
    const original = [ 'b', 'c' ], modified = [ 'a', 'b', 'c' ];
    const operations = diff( original, modified );

    assert.deepEqual( operations, [
      { type: 'insert', original: { start: 0, length: 0 }, modified: { start: 0, length: 1 } },
      { type: 'equal', original: { start: 0, length: 2 }, modified: { start: 1, length: 2 } }
    ] );

    reconstruct( original, modified, operations );
  } );

  await t.test( 'detects an insertion in the middle', () => {
    const original = [ 'a', 'c' ], modified = [ 'a', 'b', 'c' ];
    const operations = diff( original, modified );

    assert.deepEqual( operations, [
      { type: 'equal', original: { start: 0, length: 1 }, modified: { start: 0, length: 1 } },
      { type: 'insert', original: { start: 1, length: 0 }, modified: { start: 1, length: 1 } },
      { type: 'equal', original: { start: 1, length: 1 }, modified: { start: 2, length: 1 } }
    ] );

    reconstruct( original, modified, operations );
  } );

  await t.test( 'detects a deletion', () => {
    const original = [ 'a', 'b', 'c' ], modified = [ 'a', 'c' ];
    const operations = diff( original, modified );

    assert.deepEqual( operations, [
      { type: 'equal', original: { start: 0, length: 1 }, modified: { start: 0, length: 1 } },
      { type: 'delete', original: { start: 1, length: 1 }, modified: { start: 1, length: 0 } },
      { type: 'equal', original: { start: 2, length: 1 }, modified: { start: 1, length: 1 } }
    ] );

    reconstruct( original, modified, operations );
  } );

  await t.test( 'represents a replacement as delete and insert', () => {
    const original = [ 'a', 'b', 'c' ], modified = [ 'a', 'x', 'c' ];
    const operations = diff( original, modified );

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

  await t.test( 'supports minimal mode', () => {
    const algorithm = new Myers( { mode: 'minimal' } );
    const original = [ 'a', 'b', 'c' ], modified = [ 'a', 'x', 'c' ];
    const operations = algorithm.diff( original, modified, equals );

    assert.equal( operations.filter( ( { type } ) => type === 'equal' ).reduce(
      ( sum, { original } ) => sum + original.length, 0
    ), 2 );

    reconstruct( original, modified, operations );
  } );

  await t.test( 'keeps fast-mode fallback valid', () => {
    const algorithm = new Myers( { mode: 'fast' } );
    const original = Array.from( { length: 2000 }, ( _, i ) => `a${ i }` );
    const modified = Array.from( { length: 2000 }, ( _, i ) => `b${ i }` );
    const operations = algorithm.diff( original, modified, equals );

    reconstruct( original, modified, operations );
  } );
} );
