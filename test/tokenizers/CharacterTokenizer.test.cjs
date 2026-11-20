const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );

const { CharacterTokenizer } = require( '../../.test-dist/tokenizers/CharacterTokenizer.js' );
const assertTokenComplete = require( '../helpers/assertTokenComplete.cjs' );


test( 'CharacterTokenizer', async t => {
  const tokenizer = new CharacterTokenizer();

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

  await t.test( 'handles empty input', () => {
    assert.deepEqual( tokenizer.tokenize( '' ), [] );
  } );
} );
