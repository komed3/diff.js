const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );
const { assertTokenComplete } = require( './utils.cjs' );


const { Character } = require( '../../dist/cjs/tokenizers/Character.js' );
const tokenizer = new Character();


test( 'Character', async t => {
  await t.test( 'tokenizes individual characters', () => {
    const tokens = tokenizer.tokenize( 'Hello' );

    assert.deepEqual( tokens.map( ( { value } ) => value ), [ 'H', 'e', 'l', 'l', 'o' ] );
    assert.ok( tokens.every( ( { type } ) => type === 'character' ) );
    assertTokenComplete( 'Hello', tokens );
  } );

  await t.test( 'keeps Unicode grapheme clusters intact', () => {
    const text = 'A😀e\u0301👨‍👩‍👧‍👦', tokens = tokenizer.tokenize( text );

    assert.deepEqual( tokens.map( ( { value } ) => value ), [ 'A', '😀', 'e\u0301', '👨‍👩‍👧‍👦' ] );
    assertTokenComplete( text, tokens );
  } );

  await t.test( 'uses UTF-16 offsets', () => {
    const tokens = tokenizer.tokenize( 'A😀B' );

    assert.deepEqual( tokens.map( ( { start, end } ) => ( { start, end } ) ), [
      { start: 0, end: 1 }, { start: 1, end: 3 }, { start: 3, end: 4 }
    ] );
  } );

  await t.test( 'handles empty input', () => {
    assert.deepEqual( tokenizer.tokenize( '' ), [] );
  } );
} );
