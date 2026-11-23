const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );
const { assertTokenComplete } = require( './utils.cjs' );


const { Word } = require( '../../.test-dist/tokenizers/Word.js' );
const tokenizer = new Word( { locale: 'en' } );


test( 'Word', async t => {
  await t.test( 'separates words, whitespace and punctuation', () => {
    const text = 'Hello, world!', tokens = tokenizer.tokenize( text );

    assert.deepEqual( tokens.map( ( { type } ) => type ), [ 'word', 'punctuation', 'whitespace', 'word', 'punctuation' ] );
    assert.deepEqual( tokens.map( ( { value } ) => value ), [ 'Hello', ',', ' ', 'world', '!' ] );
    assertTokenComplete( text, tokens );
  } );
} );
