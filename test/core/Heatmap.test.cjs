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


test( 'Heatmap', async t => {
  await t.test( 'creates a raster with the configured dimensions', () => {
    const heatmap = create( 'one', 'two', { x: 4, y: 3 } );

    assert.equal( heatmap.width, 4 );
    assert.equal( heatmap.height, 3 );
    assert.equal( heatmap.cells.length, 12 );
  } );

  await t.test( 'creates an empty raster for unchanged input', () => {
    const heatmap = create( 'one\ntwo', 'one\ntwo', { x: 2, y: 2 } );
    assert.ok( heatmap.cells.every( ( { activity, intensity } ) => activity === 0 && intensity === 0 ) );
  } );
} );
