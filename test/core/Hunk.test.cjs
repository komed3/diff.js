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
} );
