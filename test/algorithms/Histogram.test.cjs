const assert = require( 'node:assert/strict' );
const shared = require( './shared.cjs' );
const { assertMinimal, diff, getEqualLength, reconstruct } = require( './utils.cjs' );


const { Histogram } = require( '../../.test-dist/algorithms/Histogram.js' );
const algorithm = new Histogram();


shared( 'Histogram', algorithm, async t => {
  await t.test( 'uses repeated elements as anchors', () => {
    const o = [ 'a', 'a', 'b', 'b', 'c' ], m = [ 'a', 'b', 'b', 'c', 'c' ], ops = diff( o, m, algorithm );

    reconstruct( o, m, ops );
    assert.equal( getEqualLength( ops ), 4 );
  } );

  await t.test( 'prefers rarer anchors when candidates have equal length', () => {
    const o = [ 'p', 'x', 'x', 'q', 'y', 'z', 'r' ], m = [ 't', 'y', 'z', 'u', 'x', 'x', 'v' ];
    const ops = diff( o, m, algorithm );

    reconstruct( o, m, ops );
    assert.deepEqual( ops.find( ( { type } ) => type === 'equal' ), {
      type: 'equal', original: { start: 4, length: 2 }, modified: { start: 1, length: 2 }
    } );
  } );

  await t.test( 'handles regions without common elements', () => {
    const o = [ 'a', 'b' ], m = [ 'c', 'd' ], ops = diff( o, m, algorithm );
    reconstruct( o, m, ops );
  } );

  await t.test( 'produces deterministic results', () => {
    const o = [ 'a', 'a', 'b', 'b', 'c' ], m = [ 'a', 'b', 'b', 'c', 'c' ];
    assert.deepEqual( diff( o, m, algorithm ), diff( o, m, algorithm ) );
  } );

  await t.test( 'handles repeated values with sparse replacements', () => {
    for ( const size of [ 256, 512, 1024 ] ) {
      const o = Array.from( { length: size }, ( _, i ) => i % 8 ), m = o.slice();
      let changes = 0;

      for ( let i = 16; i < size; i += 64 ) m[ i ] = -i, changes++;
      const ops = diff( o, m, algorithm );

      reconstruct( o, m, ops );
      assert.equal( getEqualLength( ops ), size - changes );
    }
  } );

  await t.test( 'falls back when all repeated groups exceed the frequency limit', () => {
    const o = [ ...Array( 65 ).fill( 'a' ), ...Array( 65 ).fill( 'b' ) ];
    const m = [ ...Array( 65 ).fill( 'b' ), ...Array( 65 ).fill( 'a' ) ];

    assertMinimal( o, m, diff( o, m, algorithm ) );
  } );
} );
