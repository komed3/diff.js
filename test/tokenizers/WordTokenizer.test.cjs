const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );

const { WordTokenizer } = require( '../../.test-dist/tokenizers/WordTokenizer.js' );
const assertTokenComplete = require( '../helpers/assertTokenComplete.cjs' );


test( 'WordTokenizer', async t => {
  const tokenizer = new WordTokenizer( 'en' );

  await t.test( 'separates words, whitespace and punctuation', () => {
    const tokens = tokenizer.tokenize( 'Hello, world!' );

    assert.deepEqual( tokens.map( ( { type } ) => type ), [
      'word', 'punctuation', 'whitespace', 'word', 'punctuation'
    ] );

    assertTokenComplete( 'Hello, world!', tokens );
  } );

  await t.test( 'recognizes Unicode words', () => {
    const text = 'Grüße 世界 مرحبًا', tokens = tokenizer.tokenize( text );

    assert.ok( tokens.some( ( { value, type } ) => value === 'Grüße' && type === 'word' ) );
    assert.ok( tokens.some( ( { type } ) => type === 'word' ) );
    assertTokenComplete( text, tokens );
  } );

  await t.test( 'preserves whitespace and punctuation', () => {
    const text = '\tHello\n\nworld... ', tokens = tokenizer.tokenize( text );

    assert.ok( tokens.some( ( { type } ) => type === 'whitespace' ) );
    assert.ok( tokens.some( ( { type } ) => type === 'punctuation' ) );
    assertTokenComplete( text, tokens );
  } );

  await t.test( 'handles empty input', () => {
    assert.deepEqual( tokenizer.tokenize( '' ), [] );
  } );
} );
