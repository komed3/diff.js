const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );

const { HuntSzymanski } = require( '../../.test-dist/algorithms/HuntSzymanski.js' );
const { diff, reconstruct, editDistance, getEditDistance, equals } = require( '../utils.cjs' );


const algorithm = new HuntSzymanski();
const d = ( o, m ) => diff( o, m, algorithm );


test( 'HuntSzymanski', async t => {} );
