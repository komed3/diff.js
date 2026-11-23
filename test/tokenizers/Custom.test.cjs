const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );


const { Custom } = require( '../../.test-dist/tokenizers/Custom.js' );


test( 'Custom', async t => {
  await t.test( 'delegates tokenization to the callback', () => {
    const tokenizer = new Custom( { callback: t => [ { type: 'custom', value: t, start: 0, end: t.length } ] } );
    assert.deepEqual( tokenizer.tokenize( 'Hello' ), [ { type: 'custom', value: 'Hello', start: 0, end: 5 } ] );
  } );

  await t.test( 'preserves custom token properties', () => {
    const tokenizer = new Custom( { callback: t => [ {
      type: 'identifier', value: t, start: 0, end: t.length,
      language: 'typescript', scope: 'variable', declaration: true
    } ] } );

    const tokens = tokenizer.tokenize( 'customerId' );

    assert.equal( tokens[ 0 ].type, 'identifier' );
    assert.equal( tokens[ 0 ].language, 'typescript' );
    assert.equal( tokens[ 0 ].scope, 'variable' );
    assert.equal( tokens[ 0 ].declaration, true );
  } );

  await t.test( 'passes the original text to the callback', () => {
    let received = null;
    const tokenizer = new Custom( { callback: t => { received = t; return [] } } );

    tokenizer.tokenize( 'Unicode 😀' );
    assert.equal( received, 'Unicode 😀' );
  } );
} );
