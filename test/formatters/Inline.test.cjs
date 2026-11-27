const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );


const { Myers } = require( '../../dist/cjs/algorithms/Myers.js' );
const { Engine } = require( '../../dist/cjs/core/Engine.js' );
const { Inline } = require( '../../dist/cjs/formatters/Inline.js' );
const { Word } = require( '../../dist/cjs/tokenizers/Word.js' );


const algorithm = new Myers();
const engine = ( options ) => new Engine( { algorithm, ...options } );
const format = ( original, modified, options = {}, engineOptions = {} ) =>
  new Inline( options ).format( engine( engineOptions ).process( { original, modified } ) );


test( 'Inline', async t => {
  await t.test( 'formats changed lines', () => {
    const result = format( 'old', 'new', { context: 0 } );

    assert.deepEqual( result, { granularity: 'line', lines: [ { number: 1, tokens: [
      { type: 'delete', value: 'old' }, { type: 'insert', value: 'new' }
    ] } ] } );
  } );

  await t.test( 'preserves unchanged lines', () => {
    const result = format( 'first\nold\nlast', 'first\nnew\nlast', { context: 1 } );

    assert.deepEqual( result.lines.map( ( { number, tokens } ) => [ number, tokens ] ), [
      [ 1, [ { type: 'equal', value: 'first\n' } ] ],
      [ 2, [ { type: 'delete', value: 'old' }, { type: 'insert', value: 'new' } ] ],
      [ 3, [ { type: 'equal', value: 'last' } ] ]
    ] );
  } );
} );
