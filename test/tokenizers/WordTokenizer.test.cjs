const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );
const assertComplete = require( './utils.cjs' );

const { WordTokenizer } = require( '../../.test-dist/tokenizers/WordTokenizer.js' );


test( 'WordTokenizer', async t => {
  const tokenizer = new WordTokenizer( 'en' );

  await t.test( 'separates words, whitespace and punctuation', () => {
    const tokens = tokenizer.tokenize( 'Hello, world!' );

    assert.deepEqual( tokens.map( token => token.type ), [
      'word', 'punctuation', 'whitespace', 'word', 'punctuation'
    ] );

    assertComplete( 'Hello, world!', tokens );
  } );

  await t.test( 'recognizes Unicode words', () => {
    const text = 'Grüße 世界 مرحبًا', tokens = tokenizer.tokenize( text );

    assert.ok( tokens.some( token => token.value === 'Grüße' && token.type === 'word' ) );
    assert.ok( tokens.some( token => token.type === 'word' ) );
    assertComplete( text, tokens );
  } );

  await t.test( 'preserves whitespace and punctuation', () => {
    const text = '\tHello\n\nworld... ', tokens = tokenizer.tokenize( text );

    assert.ok( tokens.some( token => token.type === 'whitespace' ) );
    assert.ok( tokens.some( token => token.type === 'punctuation' ) );
    assertComplete( text, tokens );
  } );

  await t.test( 'handles empty input', () => {
    assert.deepEqual( tokenizer.tokenize( '' ), [] );
  } );
} );
