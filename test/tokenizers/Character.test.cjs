const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );
const { assertTokenComplete } = require( './utils.cjs' );


const { Character } = require( '../../.test-dist/tokenizers/Character.js' );
const tokenizer = new Character( {} );
