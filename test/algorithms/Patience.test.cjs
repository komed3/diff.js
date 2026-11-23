const assert = require( 'node:assert/strict' );
const shared = require( './shared.cjs' );
const { assertMinimal, diff, getOperationCount, reconstruct } = require( './utils.cjs' );


const { Patience } = require( '../../.test-dist/algorithms/Patience.js' );
const algorithm = new Patience();


shared( 'Patience', algorithm, async t => {
  await t.test( 'detects changes between unique anchors', () => {
    const o = [ 'start', 'old', 'middle', 'old2', 'end' ];
    const m = [ 'start', 'new', 'middle', 'new2', 'end' ];
    const ops = diff( o, m, algorithm );

    reconstruct( o, m, ops );
    assert.equal( getOperationCount( ops, 'equal' ), 3 );
    assert.equal( getOperationCount( ops, 'delete' ), 2 );
    assert.equal( getOperationCount( ops, 'insert' ), 2 );
  } );

  await t.test( 'does not use non-unique elements as anchors', () => {
    const o = [ 'a', 'b', 'b', 'c' ], m = [ 'a', 'b', 'c' ], ops = diff( o, m, algorithm );

    reconstruct( o, m, ops );
    assert.equal( getOperationCount( ops, 'delete' ), 1 );
  } );

  await t.test( 'falls back to a minimal diff when no unique anchors exist', () => {
    const o = [ 'a', 'b', 'a', 'b' ], m = [ 'b', 'a', 'b', 'a' ];
    assertMinimal( o, m, diff( o, m, algorithm ) );
  } );
} );
