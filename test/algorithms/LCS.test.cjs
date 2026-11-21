const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );

const { LCS } = require( '../../.test-dist/algorithms/LCS.js' );
const { diff, reconstruct, editDistance, getEditDistance, equals } = require( '../utils.cjs' );


const algorithm = new LCS();
