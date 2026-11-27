const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );


const { Myers } = require( '../../dist/cjs/algorithms/Myers.js' );
const { COMPARATORS } = require( '../../dist/cjs/core/Comparator.js' );
const { Engine } = require( '../../dist/cjs/core/Engine.js' );
const { Word } = require( '../../dist/cjs/tokenizers/Word.js' );


const algorithm = new Myers();
const engine = ( options ) => new Engine( { algorithm, ...options } );


test( 'Engine', async t => {
  await t.test( 'preserves unchanged input', () => {
    const result = engine().process( { original: 'one\ntwo', modified: 'one\ntwo' } );

    assert.equal( result.script.length, 2 );
    assert.ok( result.script.every( ( { operation: { type } } ) => type === 'equal' ) );
  } );

  await t.test( 'detects inserted lines', () => {
    const result = engine().process( { original: 'one\n', modified: 'one\ntwo' } );
    assert.deepEqual( result.script.map( ( { operation: { type } } ) => type ), [ 'equal', 'insert' ] );
  } );

  await t.test( 'detects deleted lines', () => {
    const result = engine().process( { original: 'one\ntwo', modified: 'one\n' } );
    assert.deepEqual( result.script.map( ( { operation: { type } } ) => type ), [ 'equal', 'delete' ] );
  } );

  await t.test( 'pairs changed lines', () => {
    const result = engine().process( { original: 'old', modified: 'new' } );

    assert.equal( result.script.length, 1 );
    assert.equal( result.script[ 0 ].operation.type, 'change' );
    assert.equal( result.script[ 0 ].original.value, 'old' );
    assert.equal( result.script[ 0 ].modified.value, 'new' );
  } );

  await t.test( 'creates token diffs for changed lines', () => {
    const result = engine( { tokenizer: new Word() } ).process( { original: 'hello world', modified: 'hello there' } );

    assert.ok( result.script[ 0 ].edit );
    assert.deepEqual( result.script[ 0 ].edit.operations.map( ( { type } ) => type ), [ 'equal', 'delete', 'insert' ] );
  } );

  await t.test( 'uses the configured token algorithm', () => {
    let calls = 0;
    const tokenAlgorithm = { diff ( sequence ) { calls++; return algorithm.diff( sequence ) } };
    engine( { tokenizer: new Word(), tokenAlgorithm } ).process( { original: 'hello world', modified: 'hello there' } );

    assert.equal( calls, 1 );
  } );

  await t.test( 'uses custom comparators', () => {
    const result = engine( { comparator: COMPARATORS.caseInsensitive() } ).process( { original: 'Hello', modified: 'hello' } );
    assert.equal( result.script[ 0 ].operation.type, 'equal' );
  } );

  await t.test( 'compares line endings by default', () => {
    const result = engine().process( { original: 'text\n', modified: 'text\r\n' } );
    assert.equal( result.script[ 0 ].operation.type, 'change' );
  } );

  await t.test( 'can ignore line endings', () => {
    const result = engine( { comparator: COMPARATORS.exact( { lineEndings: false } ) } ).process( {
      original: 'text\n', modified: 'text\r\n'
    } );

    assert.equal( result.script[ 0 ].operation.type, 'equal' );
  } );

  await t.test( 'does not tokenize without a tokenizer', () => {
    const result = engine().process( { original: 'old', modified: 'new' } );
    assert.equal( result.script[ 0 ].edit, undefined );
  } );

  await t.test( 'handles a complex combination of changes', () => {
    const original = [ 'header', 'keep', 'old title', 'old detail', 'obsolete', 'middle', 'gap', 'tail old', 'footer' ].join( '\n' );
    const modified = [ 'header', 'keep', 'new title', 'new detail', 'middle', 'added', 'gap', 'tail new', 'footer' ].join( '\n' );
    const result = engine().process( { original, modified } );

    assert.deepEqual(
      result.script.map( ( { original, modified, operation } ) => [
        operation.type, original?.value ?? null, modified?.value ?? null,
        operation.original.start, operation.modified.start
      ] ),
      [
        [ 'equal', 'header', 'header', 0, 0 ],
        [ 'equal', 'keep', 'keep', 1, 1 ],
        [ 'change', 'old title', 'new title', 2, 2 ],
        [ 'change', 'old detail', 'new detail', 3, 3 ],
        [ 'delete', 'obsolete', null, 4, 2 ],
        [ 'equal', 'middle', 'middle', 5, 4 ],
        [ 'insert', null, 'added', 6, 5 ],
        [ 'equal', 'gap', 'gap', 6, 6 ],
        [ 'change', 'tail old', 'tail new', 7, 7 ],
        [ 'equal', 'footer', 'footer', 8, 8 ]
      ]
    );

    assert.equal( result.script.filter( ( { operation: { type } } ) => type === 'change' ).length, 3 );
  } );
} );
