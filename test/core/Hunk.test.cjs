const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );


const { Myers } = require( '../../.test-dist/algorithms/Myers.js' );
const { Engine } = require( '../../.test-dist/core/Engine.js' );
const { Hunk } = require( '../../.test-dist/core/Hunk.js' );


const engine = new Engine( { algorithm: new Myers() } );
const create = ( original, modified, ops ) => new Hunk( ops ).create( engine.process( { original, modified } ) );
