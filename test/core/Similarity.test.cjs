const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );


const { Myers } = require( '../../.test-dist/algorithms/Myers.js' );
const { Engine } = require( '../../.test-dist/core/Engine.js' );
const { Similarity } = require( '../../.test-dist/core/Similarity.js' );
const { Character } = require( '../../.test-dist/tokenizers/Character.js' );


const algorithm = new Myers();
const engine = ( options ) => new Engine( { algorithm, ...options } );
const analyze = ( original, modified, options = {} ) => new Similarity(
  engine( options ).process( { original, modified } ), options
);
