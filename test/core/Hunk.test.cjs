const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );


const { Myers } = require( '../../dist/algorithms/Myers.js' );
const { Engine } = require( '../../dist/core/Engine.js' );
const { Hunk } = require( '../../dist/core/Hunk.js' );


const engine = new Engine( { algorithm: new Myers() } );
const create = ( original, modified, ops ) => new Hunk( ops ).create( engine.process( { original, modified } ) );

const assertHeader = ( { header: { original, modified } }, o, m ) => {
  assert.deepEqual( original, o );
  assert.deepEqual( modified, m );
};


test( 'Hunk', async t => {
  await t.test( 'creates hunks without context', () => {
    const hunks = create( 'a\nb\nc', 'a\nx\nc', { context: 0 } );

    assert.equal( hunks.length, 1 );
    assert.deepEqual( hunks[ 0 ].original, { start: 1, length: 1 } );
    assert.deepEqual( hunks[ 0 ].modified, { start: 1, length: 1 } );
    assert.deepEqual( hunks[ 0 ].lines.map( ( { operation: { type } } ) => type ), [ 'change' ] );
    assertHeader( hunks[ 0 ], { start: 2, length: 1 }, { start: 2, length: 1 } );
  } );

  await t.test( 'includes the requested context', () => {
    const hunks = create( 'a\nb\nc\nd\ne', 'a\nx\nc\nd\ne', { context: 1 } );

    assert.equal( hunks.length, 1 );
    assert.deepEqual( hunks[ 0 ].original, { start: 0, length: 3 } );
    assert.deepEqual( hunks[ 0 ].modified, { start: 0, length: 3 } );
    assert.deepEqual( hunks[ 0 ].lines.map( ( { operation: { type } } ) => type ), [ 'equal', 'change', 'equal' ] );
    assertHeader( hunks[ 0 ], { start: 1, length: 3 }, { start: 1, length: 3 } );
  } );

  await t.test( 'merges changes whose context overlaps or touches', () => {
    const hunks = create( 'a\nb\nc\nd\ne\nf\ng', 'x\nb\nc\ny\ne\nf\ng', { context: 1 } );

    assert.equal( hunks.length, 1 );
    assert.deepEqual( hunks[ 0 ].original, { start: 0, length: 5 } );
    assert.deepEqual( hunks[ 0 ].modified, { start: 0, length: 5 } );
    assertHeader( hunks[ 0 ], { start: 1, length: 5 }, { start: 1, length: 5 } );
  } );

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
    assertHeader( inserted[ 0 ], { start: 0, length: 0 }, { start: 1, length: 1 } );

    assert.deepEqual( deleted[ 0 ].original, { start: 0, length: 1 } );
    assert.deepEqual( deleted[ 0 ].modified, { start: 0, length: 0 } );
    assertHeader( deleted[ 0 ], { start: 1, length: 1 }, { start: 0, length: 0 } );
  } );

  await t.test( 'returns no hunks for equal or empty input', () => {
    assert.deepEqual( create( 'a\nb', 'a\nb' ), [] );
    assert.deepEqual( create( '', '' ), [] );
  } );

  await t.test( 'rejects invalid context', () => {
    for ( const context of [ -1, 1.5, NaN, Infinity ] ) assert.throws( () => new Hunk( { context } ), Error );
  } );
} );
