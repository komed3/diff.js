const assert = require( 'node:assert/strict' );
const { describe, it } = require( 'node:test' );


const { Myers } = require( '../../.test-dist/algorithms/Myers.js' );
const { COMPARATORS } = require( '../../.test-dist/core/Comparator.js' );
const { Engine } = require( '../../.test-dist/core/Engine.js' );
const { Word } = require( '../../.test-dist/tokenizers/Word.js' );


const algorithm = new Myers();
const engine = ( options ) => new Engine( { algorithm, ...options } );


describe( 'Engine', () => {
  it( 'preserves unchanged input', () => {
    const result = engine().process( { original: 'one\ntwo', modified: 'one\ntwo' } );

    assert.equal( result.script.length, 2 );
    assert.ok( result.script.every( ( { operation: { type } } ) => type === 'equal' ) );
  } );
} );
