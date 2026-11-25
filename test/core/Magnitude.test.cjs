const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );


const { Myers } = require( '../../.test-dist/algorithms/Myers.js' );
const { Analyzer } = require( '../../.test-dist/core/Analyzer.js' );
const { Engine } = require( '../../.test-dist/core/Engine.js' );
const { Hunk } = require( '../../.test-dist/core/Hunk.js' );
const { Magnitude } = require( '../../.test-dist/core/Magnitude.js' );


const engine = new Engine( { algorithm: new Myers() } );
const analyze = ( original, modified ) => {
  const result = engine.process( { original, modified } );
  const hunks = new Hunk( { context: 1 } ).create( result );

  return new Magnitude( hunks, new Analyzer( result ).lines() );
};


test( 'Magnitude', async t => {
  await t.test( 'calculates absolute magnitude', () => {
    const magnitude = analyze( 'a\nold\nremoved\nb', 'a\nnew\nb\nadded' );

    assert.deepEqual( magnitude.absolute(), { value: 1, baseValue: 4, magnitude: 1 } );
    assert.deepEqual( magnitude.absolute( { metric: 'delta' } ), { value: 0, baseValue: 4, magnitude: 0 } );
  } );
} );
