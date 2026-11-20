const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );

const { Engine } = require( '../../.test-dist/core/Engine.js' );
const { MyersAlgorithm } = require( '../../.test-dist/algorithms/MyersAlgorithm.js' );
const { CharacterTokenizer } = require( '../../.test-dist/tokenizers/CharacterTokenizer.js' );
const { CustomTokenizer } = require( '../../.test-dist/tokenizers/CustomTokenizer.js' );


test( 'Engine', async t => {
  await t.test( 'tokenizes both texts and returns the diff result', () => {
    const engine = new Engine( new CharacterTokenizer(), new MyersAlgorithm() );
    const result = engine.diff( 'Hello', 'Hello!' );

    assert.deepEqual( result.original.map( token => token.value ), [ 'H', 'e', 'l', 'l', 'o' ] );
    assert.deepEqual( result.modified.map( token => token.value ), [ 'H', 'e', 'l', 'l', 'o', '!' ] );

    assert.deepEqual( result.operations.map( operation => operation.type ), [ 'equal', 'insert' ] );
    assert.deepEqual( result.operations[ 0 ].original, { start: 0, length: 5 } );
    assert.deepEqual( result.operations[ 0 ].modified, { start: 0, length: 5 } );
    assert.deepEqual( result.operations[ 1 ].original, { start: 5, length: 0 } );
    assert.deepEqual( result.operations[ 1 ].modified, { start: 5, length: 1 } );
  } );

  await t.test( 'handles empty texts', () => {
    const engine = new Engine( new CharacterTokenizer(), new MyersAlgorithm() );
    const result = engine.diff( '', '' );

    assert.deepEqual( result.original, [] );
    assert.deepEqual( result.modified, [] );
    assert.deepEqual( result.operations, [] );
  } );

  await t.test( 'preserves custom token properties', () => {
    const tokenizer = new CustomTokenizer( text => [ {
      type: 'identifier', value: text, start: 0, end: text.length,
      language: 'typescript', scope: 'variable'
    } ] );

    const engine = new Engine( tokenizer, new MyersAlgorithm() );
    const result = engine.diff( 'customerId', 'accountId' );

    assert.equal( result.original[ 0 ].language, 'typescript' );
    assert.equal( result.original[ 0 ].scope, 'variable' );
    assert.equal( result.modified[ 0 ].language, 'typescript' );
    assert.equal( result.modified[ 0 ].scope, 'variable' );
  } );
} );
