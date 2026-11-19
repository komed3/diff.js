const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );

const { SentenceTokenizer } = require( '../../.test-dist/tokenizers/SentenceTokenizer.js' );
const assertComplete = require( '../helpers/assertComplete.cjs' );


test( 'SentenceTokenizer', async t => {
  const tokenizer = new SentenceTokenizer( 'en' );

  await t.test( 'separates sentences', () => {
    const text = 'Hello world. How are you?', tokens = tokenizer.tokenize( text );

    assert.equal( tokens.length, 2 );
    assert.ok( tokens.every( ( { type } ) => type === 'sentence' ) );
    assertComplete( text, tokens );
  } );

  await t.test( 'preserves sentence whitespace and punctuation', () => {
    const text = 'First sentence.  Second sentence!\nThird sentence?';
    const tokens = tokenizer.tokenize( text );

    assertComplete( text, tokens );
  } );

  await t.test( 'handles Unicode text', () => {
    const text = 'Grüße aus Köln. 你好！مرحبا؟', tokens = tokenizer.tokenize( text );

    assert.ok( tokens.length > 0 );
    assertComplete( text, tokens );
  } );

  await t.test( 'handles empty input', () => {
    assert.deepEqual( tokenizer.tokenize( '' ), [] );
  } );
} );
