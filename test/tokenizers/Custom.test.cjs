const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );


const { Custom } = require( '../../.test-dist/tokenizers/Custom.js' );


test( 'Custom', async t => {
  await t.test( 'delegates tokenization to the callback', () => {
    const tokenizer = new Custom( { callback: t => [ { type: 'custom', value: t, start: 0, end: t.length } ] } );
    assert.deepEqual( tokenizer.tokenize( 'Hello' ), [ { type: 'custom', value: 'Hello', start: 0, end: 5 } ] );
  } );
} );
