const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );

const { MyersAlgorithm } = require( '../../.test-dist/algorithms/MyersAlgorithm.js' );
const assertDiffComplete = require( '../helpers/assertDiffComplete.cjs' );


function createTokens ( values ) {
  return values.map( ( value, index ) => ( {
    type: 'character', value, start: index, end: index + value.length
  } ) );
}


function createSequences ( alphabet, maxLength ) {
  const sequences = [ [] ];

  for ( let length = 1; length <= maxLength; length++ ) {
    const previous = sequences.filter( sequence => sequence.length === length - 1 );

    for ( const sequence of previous ) {
      for ( const value of alphabet ) sequences.push( [ ...sequence, value ] );
    }
  }

  return sequences;
}


function lcsLength ( original, modified ) {
  const lengths = Array( modified.length + 1 ).fill( 0 );

  for ( let i = 1; i <= original.length; i++ ) {
    let diagonal = 0;

    for ( let j = 1; j <= modified.length; j++ ) {
      const previous = lengths[ j ];

      lengths[ j ] = original[ i - 1 ] === modified[ j - 1 ]
        ? diagonal + 1
        : Math.max( lengths[ j ], lengths[ j - 1 ] );

      diagonal = previous;
    }
  }

  return lengths[ modified.length ];
}


test( 'MyersAlgorithm', async t => {
  const algorithm = new MyersAlgorithm();

  await t.test( 'returns an equal operation for identical sequences', () => {
    const tokens = createTokens( [ 'A', 'B', 'C' ] );
    const operations = algorithm.diff( tokens, tokens );

    assert.deepEqual( operations, [ {
      type: 'equal',
      original: { start: 0, length: 3 },
      modified: { start: 0, length: 3 }
    } ] );

    assert.equal( assertDiffComplete( tokens, tokens, operations ), 0 );
  } );

  await t.test( 'handles empty sequences', () => {
    const empty = [], tokens = createTokens( [ 'A', 'B' ] );

    assert.deepEqual( algorithm.diff( empty, empty ), [] );

    const insertions = algorithm.diff( empty, tokens );
    const deletions = algorithm.diff( tokens, empty );

    assert.equal( assertDiffComplete( empty, tokens, insertions ), 2 );
    assert.equal( assertDiffComplete( tokens, empty, deletions ), 2 );
  } );

  await t.test( 'handles pure insertions', () => {
    const original = createTokens( [ 'A', 'B' ] );
    const modified = createTokens( [ 'A', 'B', 'C', 'D' ] );
    const operations = algorithm.diff( original, modified );

    assert.equal( assertDiffComplete( original, modified, operations ), 2 );
    assert.deepEqual( operations.map( ( { type } ) => type ), [ 'equal', 'insert' ] );
  } );

  await t.test( 'handles pure deletions', () => {
    const original = createTokens( [ 'A', 'B', 'C', 'D' ] );
    const modified = createTokens( [ 'A', 'B' ] );
    const operations = algorithm.diff( original, modified );

    assert.equal( assertDiffComplete( original, modified, operations ), 2 );
    assert.deepEqual( operations.map( ( { type } ) => type ), [ 'equal', 'delete' ] );
  } );

  await t.test( 'represents replacements as insertions and deletions', () => {
    const original = createTokens( [ 'A', 'B', 'C' ] );
    const modified = createTokens( [ 'A', 'X', 'C' ] );
    const operations = algorithm.diff( original, modified );

    assert.equal( assertDiffComplete( original, modified, operations ), 2 );
    assert.deepEqual(
      operations.map( ( { type } ) => type ),
      [ 'equal', 'delete', 'insert', 'equal' ]
    );
  } );

  await t.test( 'merges consecutive operations of the same type', () => {
    const original = createTokens( [ 'A', 'B', 'C', 'D' ] );
    const modified = createTokens( [ 'A', 'X', 'Y', 'D' ] );
    const operations = algorithm.diff( original, modified );

    assert.equal( assertDiffComplete( original, modified, operations ), 4 );
    assert.deepEqual(
      operations.map( ( { type } ) => type ),
      [ 'equal', 'delete', 'insert', 'equal' ]
    );

    assert.equal( operations[ 1 ].original.length, 2 );
    assert.equal( operations[ 2 ].modified.length, 2 );
  } );

  await t.test( 'handles repeated token values', () => {
    const original = createTokens( [ 'A', 'B', 'A' ] );
    const modified = createTokens( [ 'A', 'A', 'B' ] );
    const operations = algorithm.diff( original, modified );

    assert.equal( assertDiffComplete( original, modified, operations ), 2 );
  } );

  await t.test( 'compares token values independently of metadata', () => {
    const original = [ {
      type: 'identifier', value: 'customerId', start: 0, end: 10,
      language: 'typescript', scope: 'variable'
    } ];

    const modified = [ {
      type: 'word', value: 'customerId', start: 0, end: 10,
      language: 'plain', scope: 'text'
    } ];

    const operations = algorithm.diff( original, modified );

    assert.deepEqual( operations, [ {
      type: 'equal',
      original: { start: 0, length: 1 },
      modified: { start: 0, length: 1 }
    } ] );

    assert.equal( assertDiffComplete( original, modified, operations ), 0 );
  } );

  await t.test( 'returns a shortest edit script for all short sequences', () => {
    const sequences = createSequences( [ 'A', 'B' ], 4 );

    for ( const originalValues of sequences ) {
      for ( const modifiedValues of sequences ) {
        const original = createTokens( originalValues );
        const modified = createTokens( modifiedValues );
        const operations = algorithm.diff( original, modified );

        const distance = assertDiffComplete( original, modified, operations );
        const expected = original.length + modified.length -
          2 * lcsLength( originalValues, modifiedValues );

        assert.equal(
          distance,
          expected,
          `${originalValues.join( '' )} -> ${modifiedValues.join( '' )}`
        );
      }
    }
  } );
} );
