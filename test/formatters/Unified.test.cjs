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

  await t.test( 'uses exact engine positions', () => {
    const { hunks } = format( 'first\nold\nmiddle\nremoved\nlast', 'first\nnew\nmiddle\nadded\nlast', { context: 0 } );

    assert.deepEqual( hunks.map( ( { original, modified, header } ) => [ original, modified, header ] ), [
      [ { start: 1, length: 1 }, { start: 1, length: 1 }, { original: { start: 2, length: 1 }, modified: { start: 2, length: 1 } } ],
      [ { start: 3, length: 1 }, { start: 3, length: 1 }, { original: { start: 4, length: 1 }, modified: { start: 4, length: 1 } } ]
    ] );
  } );

  await t.test( 'handles inserted lines and empty original ranges', () => {
    const { hunks } = format( 'first\nlast', 'first\nadded\nlast', { context: 0 } );

    assert.equal( hunks.length, 1 );
    assert.deepEqual( hunks[ 0 ].original, { start: 1, length: 0 } );
    assert.deepEqual( hunks[ 0 ].modified, { start: 1, length: 1 } );
    assert.deepEqual( hunks[ 0 ].header, { original: { start: 1, length: 0 }, modified: { start: 2, length: 1 } } );
  } );

  await t.test( 'handles deleted lines and empty modified ranges', () => {
    const { hunks } = format( 'first\nremoved\nlast', 'first\nlast', { context: 0 } );

    assert.equal( hunks.length, 1 );
    assert.deepEqual( hunks[ 0 ].original, { start: 1, length: 1 } );
    assert.deepEqual( hunks[ 0 ].modified, { start: 1, length: 0 } );
    assert.deepEqual( hunks[ 0 ].header, { original: { start: 2, length: 1 }, modified: { start: 1, length: 0 } } );
  } );

  await t.test( 'returns no hunks for unchanged input', () => {
    assert.deepEqual( format( 'first\nlast', 'first\nlast' ), { granularity: 'line', hunks: [] } );
  } );
} );
