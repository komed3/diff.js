const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );


const { Myers } = require( '../../.test-dist/algorithms/Myers.js' );
const { Analyzer } = require( '../../.test-dist/core/Analyzer.js' );
const { Engine } = require( '../../.test-dist/core/Engine.js' );
const { Word } = require( '../../.test-dist/tokenizers/Word.js' );


const algorithm = new Myers();
const engine = ( options ) => new Engine( { algorithm, ...options } );
const analyze = ( data, options ) => new Analyzer( engine( options ).process( data ) );
