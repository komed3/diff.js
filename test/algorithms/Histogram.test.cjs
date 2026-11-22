const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );

const shared = require( './shared.cjs' );
const { diff, reconstruct, getEqualLength, equals } = require( './utils.cjs' );


const { Histogram } = require( '../../.test-dist/algorithms/Histogram.js' );
const algorithm = new Histogram();


shared( 'Histogram', algorithm );

test( 'Histogram specifics', async t => {
  await t.test( 'uses repeated elements as anchors', () => {
    const original = [ 'a', 'a', 'b', 'b', 'c' ];
    const modified = [ 'a', 'b', 'b', 'c', 'c' ];
    const operations = diff( original, modified, algorithm );

    reconstruct( original, modified, operations );
    assert.equal( getEqualLength( operations ), 4 );
  } );

  await t.test( 'prefers rarer common elements', () => {
    const original = [ 'a', 'a', 'a', 'b', 'c' ];
    const modified = [ 'a', 'a', 'b', 'c', 'c' ];
    const operations = diff( original, modified, algorithm );

    reconstruct( original, modified, operations );
    assert.equal( getEqualLength( operations ), 4 );
  } );

  await t.test( 'handles regions without common elements', () => {
    const original = [ 'a', 'b' ], modified = [ 'c', 'd' ];
    const operations = diff( original, modified, algorithm );

    reconstruct( original, modified, operations );
  } );

  await t.test( 'produces deterministic results', () => {
    const original = [ 'a', 'a', 'b', 'b', 'c' ], modified = [ 'a', 'b', 'b', 'c', 'c' ];
    assert.deepEqual( diff( original, modified, algorithm ), diff( original, modified, algorithm ) );
  } );

  await t.test( 'handles repeated values with sparse replacements', () => {
    for ( const size of [ 256, 512, 1024 ] ) {
      const original = Array.from( { length: size }, ( _, i ) => i % 8 );
      const modified = original.slice();

      let changes = 0;
      for ( let i = 16; i < size; i += 64 ) modified[ i ] = -i, changes++;
      const operations = diff( original, modified, algorithm );

      reconstruct( original, modified, operations );
      assert.equal( getEqualLength( operations ), size - changes );
    }
  } );

  await t.test( 'does not treat unequal elements as equal', () => {
    const original = [ 'a', 'b', 'c' ], modified = [ 'a', 'x', 'c' ];
    const operations = algorithm.diff( { original, modified, equals } );

    reconstruct( original, modified, operations );
    assert.equal( getEqualLength( operations ), 2 );
  } );
} );
