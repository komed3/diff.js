const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );

const { Magnitude } = require( '../../.test-dist/core/Magnitude.js' );


const createMagnitude = ( stats = {} ) => new Magnitude( {
  original: 10, modified: 14, equal: 8, inserted: 6, deleted: 2, changed: 8, delta: 4,
  changeRate: 1 / 3, insertionRate: 6 / 14, deletionRate: 0.2, retentionRate: 0.8,
  similarity: 2 / 3, growthRate: 0.4, sizeRatio: 1.4, ...stats
} );
