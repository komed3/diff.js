const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );

const { Histogram } = require( '../../.test-dist/algorithms/Histogram.js' );
const { diff, reconstruct, getOperationCount, getEqualLength, createSequences, equals } = require( '../utils.cjs' );


const algorithm = new Histogram();
const d = ( o, m ) => diff( o, m, algorithm );


test( 'Histogram', async t => {} );
