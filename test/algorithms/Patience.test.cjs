const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );

const { Patience } = require( '../../.test-dist/algorithms/Patience.js' );
const { diff, reconstruct, getOperationCount, createSequences, equals } = require( '../utils.cjs' );


const algorithm = new Patience();
const d = ( o, m ) => diff( o, m, algorithm );


test( 'Patience', async t => {} );
