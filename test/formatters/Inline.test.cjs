const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );


const { Myers } = require( '../../dist/cjs/algorithms/Myers.js' );
const { Engine } = require( '../../dist/cjs/core/Engine.js' );
const { Inline } = require( '../../dist/cjs/formatters/Inline.js' );
const { Word } = require( '../../dist/cjs/tokenizers/Word.js' );


const algorithm = new Myers();
const engine = ( options ) => new Engine( { algorithm, ...options } );
const format = ( original, modified, options = {}, engineOptions = {} ) =>
  new Inline( options ).format( engine( engineOptions ).process( { original, modified } ) );
