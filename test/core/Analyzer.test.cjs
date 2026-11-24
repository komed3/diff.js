const assert = require( 'node:assert/strict' );
const { describe, it } = require( 'node:test' );


const { Myers } = require( '../../.test-dist/algorithms/Myers.js' );
const { Analyzer } = require( '../../.test-dist/core/Analyzer.js' );
const { Engine } = require( '../../.test-dist/core/Engine.js' );
const { Word } = require( '../../.test-dist/tokenizers/Word.js' );


const algorithm = new Myers();
const engine = ( o ) => new Engine( { algorithm, ...o } );
const analyze = ( data, o ) => new Analyzer( engine( o ).process( data ) );


describe( 'Analyzer', () => {} );
