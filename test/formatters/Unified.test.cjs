const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );


const { Myers } = require( '../../dist/cjs/algorithms/Myers.js' );
const { Engine } = require( '../../dist/cjs/core/Engine.js' );
const { Unified } = require( '../../dist/cjs/formatters/Unified.js' );
const { Word } = require( '../../dist/cjs/tokenizers/Word.js' );


const algorithm = new Myers();
const engine = ( options ) => new Engine( { algorithm, ...options } );
const format = ( original, modified, options = {}, engineOptions = {} ) =>
  new Unified( options ).format( engine( engineOptions ).process( { original, modified } ) );


test( 'Unified', async t => {
  await t.test( 'creates hunks with unchanged context', () => {
    const { hunks } = format( 'first\nold\nlast', 'first\nnew\nlast', { context: 1 } );

    assert.equal( hunks.length, 1 );
    assert.deepEqual( hunks[ 0 ].original, { start: 0, length: 3 } );
    assert.deepEqual( hunks[ 0 ].modified, { start: 0, length: 3 } );
    assert.deepEqual( hunks[ 0 ].header, { original: { start: 1, length: 3 }, modified: { start: 1, length: 3 } } );
    assert.deepEqual( hunks[ 0 ].lines.map( ( { operation: { type } } ) => type ), [ 'equal', 'change', 'equal' ] );
  } );
} );
