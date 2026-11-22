const assert = require( 'node:assert/strict' );
const shared = require( './shared.cjs' );
const { assertMinimal, diff, reconstruct } = require( './utils.cjs' );


const { LCS } = require( '../../.test-dist/algorithms/LCS.js' );
const algorithm = new LCS();


shared( 'LCS', algorithm, async t => {
  await t.test( 'uses deterministic deletion-first tie-breaking', () => {
    const o = [ 'a', 'b' ], m = [ 'b', 'a' ], ops = diff( o, m, algorithm );

    reconstruct( o, m, ops );
    assert.deepEqual( ops, [
      { type: 'delete', original: { start: 0, length: 1 }, modified: { start: 0, length: 0 } },
      { type: 'equal', original: { start: 1, length: 1 }, modified: { start: 0, length: 1 } },
      { type: 'insert', original: { start: 2, length: 0 }, modified: { start: 1, length: 1 } }
    ] );
  } );

  await t.test( 'produces minimal scripts with repeated tokens', () => {
    const o = [ 'a', 'b', 'a', 'b', 'a' ], m = [ 'b', 'a', 'b', 'a', 'b' ];
    assertMinimal( o, m, diff( o, m, algorithm ) );
  } );
} );
