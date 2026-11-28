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
    const { lines } = format( 'first\nold\nlast', 'first\nnew\nlast', { context: 1 } );

    assert.deepEqual( lines.map( ( { number, tokens } ) => [ number, tokens ] ), [
      [ 1, [ { type: 'equal', value: 'first\n' } ] ],
      [ 2, [ { type: 'delete', value: 'old\n' }, { type: 'insert', value: 'new\n' } ] ],
      [ 3, [ { type: 'equal', value: 'last' } ] ]
    ] );
  } );

  await t.test( 'preserves unchanged input with all context', () => {
    const { lines } = format( 'first\nlast', 'first\nlast', { context: 'all' } );

    assert.deepEqual( lines.map( ( { number, tokens } ) => [ number, tokens ] ), [
      [ 1, [ { type: 'equal', value: 'first\n' } ] ], [ 2, [ { type: 'equal', value: 'last' } ] ]
    ] );
  } );

  await t.test( 'indicates omitted lines through line numbers', () => {
    const { lines } = format( 'old\none\ntwo\nthree\nlast', 'new\none\ntwo\nthree\nend', { context: 0 } );
    assert.deepEqual( lines.map( ( { number } ) => number ), [ 1, 5 ] );
  } );

  await t.test( 'numbers inserted lines on the modified side', () => {
    const { lines } = format( 'first\nlast', 'first\nadded\nlast', { context: 0 } );

    assert.deepEqual( lines.map( ( { number, tokens } ) => [ number, tokens ] ), [
      [ 2, [ { type: 'insert', value: 'added\n' } ] ]
    ] );
  } );

  await t.test( 'numbers deleted lines on the original side', () => {
    const { lines } = format( 'first\nremoved\nlast', 'first\nlast', { context: 0 } );

    assert.deepEqual( lines.map( ( { number, tokens } ) => [ number, tokens ] ), [
      [ 2, [ { type: 'delete', value: 'removed\n' } ] ]
    ] );
  } );

  await t.test( 'uses token granularity for changed lines', () => {
    const { lines } = format( 'hello world', 'hello there', { context: 0, granularity: 'token' }, {
      tokenizer: new Word()
    } );

    assert.deepEqual( lines, [ { number: 1, tokens: [
      { type: 'equal', value: 'hello ' }, { type: 'delete', value: 'world' }, { type: 'insert', value: 'there' }
    ] } ] );
  } );

  await t.test( 'falls back to line granularity without token edits', () => {
    const { lines } = format( 'old', 'new', { context: 0, granularity: 'token' } );
    assert.deepEqual( lines[ 0 ].tokens, [ { type: 'delete', value: 'old' }, { type: 'insert', value: 'new' } ] );
  } );

  await t.test( 'preserves different line endings', () => {
    const { lines } = format( 'text\n', 'text\r\n', { context: 0 } );
    assert.deepEqual( lines[ 0 ].tokens, [ { type: 'delete', value: 'text\n' }, { type: 'insert', value: 'text\r\n' } ] );
  } );

  await t.test( 'preserves empty input', () => {
    assert.deepEqual( format( '', '', { context: 'all' } ), { granularity: 'line', lines: [] } );
  } );

  await t.test( 'rejects invalid granularity', () => {
    assert.throws( () => new Inline( { granularity: 'character' } ), Error );
  } );
} );
