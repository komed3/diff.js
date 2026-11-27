const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );


const { Myers } = require( '../../dist/cjs/algorithms/Myers.js' );
const { Engine } = require( '../../dist/cjs/core/Engine.js' );
const { Inline } = require( '../../dist/cjs/formatters/Inline.js' );
const { Word } = require( '../../dist/cjs/tokenizers/Word.js' );
