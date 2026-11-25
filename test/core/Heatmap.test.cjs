const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );


const { Myers } = require( '../../.test-dist/algorithms/Myers.js' );
const { Engine } = require( '../../.test-dist/core/Engine.js' );
const { Heatmap } = require( '../../.test-dist/core/Heatmap.js' );
const { Character } = require( '../../.test-dist/tokenizers/Character.js' );


const algorithm = new Myers();
const engine = ( options ) => new Engine( { algorithm, ...options } );
const create = ( original, modified, options = {}, engineOptions = {} ) => {
  const result = engine( engineOptions ).process( { original, modified } );
  return new Heatmap( result ).create( options );
};
