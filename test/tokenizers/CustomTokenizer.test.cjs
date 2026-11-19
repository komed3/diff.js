const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );

const { CustomTokenizer } = require( '../../.test-dist/tokenizers/CustomTokenizer.js' );


test( 'CustomTokenizer', async t => {
  await t.test( 'delegates tokenization to the callback', () => {
    const tokenizer = new CustomTokenizer( text => [ {
      type: 'custom', value: text, start: 0, end: text.length
    } ] );

    assert.deepEqual( tokenizer.tokenize( 'Hello' ), [ {
      type: 'custom', value: 'Hello', start: 0, end: 5
    } ] );
  } );

  await t.test( 'preserves custom token properties', () => {
    const tokenizer = new CustomTokenizer( text => [ {
      type: 'identifier', value: text, start: 0, end: text.length,
      language: 'typescript', scope: 'variable', declaration: true
    } ] );

    const tokens = tokenizer.tokenize( 'customerId' );

    assert.equal( tokens[ 0 ].type, 'identifier' );
    assert.equal( tokens[ 0 ].language, 'typescript' );
    assert.equal( tokens[ 0 ].scope, 'variable' );
    assert.equal( tokens[ 0 ].declaration, true );
  } );

  await t.test( 'passes the original text to the callback', () => {
    let received = null;

    const tokenizer = new CustomTokenizer( text => {
      received = text;
      return [];
    } );

    tokenizer.tokenize( 'Unicode 😀' );
    assert.equal( received, 'Unicode 😀' );
  } );
} );
