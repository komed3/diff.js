const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );
const { assertTokenComplete } = require( './utils.cjs' );


const { Character } = require( '../../.test-dist/tokenizers/Character.js' );
const tokenizer = new Character( {} );


test( 'Character', async t => {
  await t.test( 'tokenizes individual characters', () => {
    const tokens = tokenizer.tokenize( 'Hello' );

    assert.deepEqual( tokens.map( ( { value } ) => value ), [ 'H', 'e', 'l', 'l', 'o' ] );
    assert.ok( tokens.every( ( { type } ) => type === 'character' ) );
    assertTokenComplete( 'Hello', tokens );
  } );
} );
