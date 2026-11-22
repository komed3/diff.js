const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );

const shared = require( './shared.cjs' );
const { diff, reconstruct, assertMinimal, createSequences } = require( './utils.cjs' );

const { LCS } = require( '../../.test-dist/algorithms/LCS.js' );
const algorithm = new LCS();


shared( 'LCS', algorithm );

test( 'LCS specifics', async t => {
  await t.test( 'uses deterministic deletion-first tie-breaking', () => {
    const original = [ 'a', 'b' ], modified = [ 'b', 'a' ];
    const operations = diff( original, modified, algorithm );

    assert.deepEqual( operations, [
      { type: 'delete', original: { start: 0, length: 1 }, modified: { start: 0, length: 0 } },
      { type: 'equal', original: { start: 1, length: 1 }, modified: { start: 0, length: 1 } },
      { type: 'insert', original: { start: 2, length: 0 }, modified: { start: 1, length: 1 } }
    ] );

    reconstruct( original, modified, operations );
  } );

  await t.test( 'produces minimal edit scripts for short sequences', () => {
    const sequences = createSequences();

    for ( const original of sequences ) for ( const modified of sequences )
      assertMinimal( original, modified, diff( original, modified, algorithm ) );
  } );
} );
