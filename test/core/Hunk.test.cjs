const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );


const { Myers } = require( '../../.test-dist/algorithms/Myers.js' );
const { Engine } = require( '../../.test-dist/core/Engine.js' );
const { Hunk } = require( '../../.test-dist/core/Hunk.js' );


const engine = new Engine( { algorithm: new Myers() } );
const create = ( original, modified, ops ) => new Hunk( ops ).create( engine.process( { original, modified } ) );


test( 'Hunk', async t => {
  await t.test( 'creates hunks without context', () => {
    const hunks = create( 'a\nb\nc', 'a\nx\nc', { context: 0 } );

    assert.equal( hunks.length, 1 );
    assert.deepEqual( hunks[ 0 ].original, { start: 1, length: 1 } );
    assert.deepEqual( hunks[ 0 ].modified, { start: 1, length: 1 } );
    assert.deepEqual( hunks[ 0 ].lines.map( ( { operation: { type } } ) => type ), [ 'change' ] );
  } );

  await t.test( 'includes the requested context', () => {
    const hunks = create( 'a\nb\nc\nd\ne', 'a\nx\nc\nd\ne', { context: 1 } );

    assert.equal( hunks.length, 1 );
    assert.deepEqual( hunks[ 0 ].original, { start: 0, length: 3 } );
    assert.deepEqual( hunks[ 0 ].modified, { start: 0, length: 3 } );
    assert.deepEqual( hunks[ 0 ].lines.map( ( { operation: { type } } ) => type ), [ 'equal', 'change', 'equal' ] );
  } );

  /*await t.test( 'merges changes whose context overlaps or touches', () => {
    const hunks = create( 'a\nb\nc\nd\ne\nf\ng', 'x\nb\nc\nd\ne\nf\ny', { context: 1 } );

    assert.equal( hunks.length, 1 );
    assert.deepEqual( hunks[ 0 ].original, { start: 0, length: 7 } );
    assert.deepEqual( hunks[ 0 ].modified, { start: 0, length: 7 } );
  } );*/

  await t.test( 'keeps changes separate when the gap exceeds the context', () => {
    const hunks = create( 'a\nb\nc\nd\ne\nf\ng', 'x\nb\nc\nd\ne\nf\ny', { context: 0 } );

    assert.equal( hunks.length, 2 );
    assert.deepEqual( hunks.map( ( hunk ) => hunk.original ), [
      { start: 0, length: 1 }, { start: 6, length: 1 }
    ] );
  } );

  await t.test( 'handles insertions and deletions at file boundaries', () => {
    const inserted = create( 'a\nb', 'x\na\nb', { context: 0 } );
    const deleted = create( 'a\nb', 'b', { context: 0 } );

    assert.deepEqual( inserted[ 0 ].original, { start: 0, length: 0 } );
    assert.deepEqual( inserted[ 0 ].modified, { start: 0, length: 1 } );
    assert.deepEqual( deleted[ 0 ].original, { start: 0, length: 1 } );
    assert.deepEqual( deleted[ 0 ].modified, { start: 0, length: 0 } );
  } );

  await t.test( 'returns no hunks for equal or empty input', () => {
    assert.deepEqual( create( 'a\nb', 'a\nb' ), [] );
    assert.deepEqual( create( '', '' ), [] );
  } );
} );
