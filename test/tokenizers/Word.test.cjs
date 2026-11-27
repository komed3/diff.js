const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );
const { assertTokenComplete } = require( './utils.cjs' );


const { Word } = require( '../../dist/cjs/tokenizers/Word.js' );
const tokenizer = new Word( { locale: 'en' } );


test( 'Word', async t => {
  await t.test( 'separates words, whitespace and punctuation', () => {
    const text = 'Hello, world!', tokens = tokenizer.tokenize( text );

    assert.deepEqual( tokens.map( ( { type } ) => type ), [ 'word', 'punctuation', 'whitespace', 'word', 'punctuation' ] );
    assert.deepEqual( tokens.map( ( { value } ) => value ), [ 'Hello', ',', ' ', 'world', '!' ] );
    assertTokenComplete( text, tokens );
  } );

  await t.test( 'recognizes Unicode words', () => {
    const text = 'Grüße 世界 مرحبًا', tokens = tokenizer.tokenize( text );

    assert.ok( tokens.some( ( { value, type } ) => value === 'Grüße' && type === 'word' ) );
    assert.ok( tokens.some( ( { value, type } ) => value === '世界' && type === 'word' ) );
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
