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

  it( 'detects inserted lines', () => {
    const result = engine().process( { original: 'one', modified: 'one\ntwo' } );
    assert.deepEqual( result.script.map( ( { operation: { type } } ) => type ), [ 'equal', 'insert' ] );
  } );

  it( 'detects deleted lines', () => {
    const result = engine().process( { original: 'one\ntwo', modified: 'one' } );
    assert.deepEqual( result.script.map( ( { operation: { type } } ) => type ), [ 'equal', 'delete' ] );
  } );

  it( 'pairs changed lines', () => {
    const result = engine().process( { original: 'old', modified: 'new' } );

    assert.equal( result.script.length, 1 );
    assert.equal( result.script[ 0 ].operation.type, 'change' );
    assert.equal( result.script[ 0 ].original.value, 'old' );
    assert.equal( result.script[ 0 ].modified.value, 'new' );
  } );
} );
