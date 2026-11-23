const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );
const { assertTokenComplete } = require( './utils.cjs' );


const { Word } = require( '../../.test-dist/tokenizers/Word.js' );
const tokenizer = new Word( { locale: 'en' } );
