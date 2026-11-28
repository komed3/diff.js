const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );


const { Myers } = require( '../../dist/cjs/algorithms/Myers.js' );
const { Engine } = require( '../../dist/cjs/core/Engine.js' );
const { SideBySide } = require( '../../dist/cjs/formatters/SideBySide.js' );
const { Word } = require( '../../dist/cjs/tokenizers/Word.js' );


const algorithm = new Myers();
const engine = ( options ) => new Engine( { algorithm, ...options } );
const format = ( original, modified, options = {}, engineOptions = {} ) =>
  new SideBySide( options ).format( engine( engineOptions ).process( { original, modified } ) );


test( 'SideBySide', async t => {
  await t.test( 'aligns changed and unchanged lines', () => {
    const { rows } = format( 'first\nold\nlast', 'first\nnew\nlast', { context: 'all' } );

    assert.deepEqual( rows.map( ( { original, modified } ) => [
      original?.number, original?.tokens, modified?.number, modified?.tokens
    ] ), [
      [ 1, [ { type: 'equal', value: 'first\n' } ], 1, [ { type: 'equal', value: 'first\n' } ] ],
      [ 2, [ { type: 'delete', value: 'old' } ], 2, [ { type: 'insert', value: 'new' } ] ],
      [ 3, [ { type: 'equal', value: 'last' } ], 3, [ { type: 'equal', value: 'last' } ] ]
    ] );
  } );

  await t.test( 'preserves independent line numbers', () => {
    const { rows } = format( 'first\nlast', 'first\nadded\nlast', { context: 'all' } );

    assert.deepEqual( rows.map( ( { original, modified } ) => [
      original?.number ?? null, modified?.number ?? null
    ] ), [ [ 1, 1 ], [ null, 2 ], [ 2, 3 ] ] );
  } );

  await t.test( 'splits token operations across both sides', () => {
    const { rows } = format( 'hello world', 'hello there', { context: 0, granularity: 'token' }, {
      tokenizer: new Word()
    } );

    assert.deepEqual( rows, [ {
      original: { number: 1, tokens: [ { type: 'equal', value: 'hello ' }, { type: 'delete', value: 'world' } ] },
      modified: { number: 1, tokens: [ { type: 'equal', value: 'hello ' }, { type: 'insert', value: 'there' } ] }
    } ] );
  } );
} );
