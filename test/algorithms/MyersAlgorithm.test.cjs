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
    const prev = sequences.filter( s => s.length === length - 1 );

    for ( const seq of prev ) for ( const value of alphabet )
      sequences.push( [ ...seq, value ] );
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
        ? diagonal + 1 : Math.max( lengths[ j ], lengths[ j - 1 ] );

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

    const ins = algorithm.diff( empty, tokens );
    const del = algorithm.diff( tokens, empty );

    assert.equal( assertDiffComplete( empty, tokens, ins ), 2 );
    assert.equal( assertDiffComplete( tokens, empty, del ), 2 );
  } );

  await t.test( 'handles pure insertions', () => {
    const orig = createTokens( [ 'A', 'B' ] ), mod = createTokens( [ 'A', 'B', 'C', 'D' ] );
    const operations = algorithm.diff( orig, mod );

    assert.equal( assertDiffComplete( orig, mod, operations ), 2 );
    assert.deepEqual( operations.map( ( { type } ) => type ), [ 'equal', 'insert' ] );
  } );

  await t.test( 'handles pure deletions', () => {
    const orig = createTokens( [ 'A', 'B', 'C', 'D' ] ), mod = createTokens( [ 'A', 'B' ] );
    const operations = algorithm.diff( orig, mod );

    assert.equal( assertDiffComplete( orig, mod, operations ), 2 );
    assert.deepEqual( operations.map( ( { type } ) => type ), [ 'equal', 'delete' ] );
  } );

  await t.test( 'represents replacements as insertions and deletions', () => {
    const orig = createTokens( [ 'A', 'B', 'C' ] ), mod = createTokens( [ 'A', 'X', 'C' ] );
    const operations = algorithm.diff( orig, mod );

    assert.equal( assertDiffComplete( orig, mod, operations ), 2 );
    assert.deepEqual( operations.map( ( { type } ) => type ), [ 'equal', 'delete', 'insert', 'equal' ] );
  } );

  await t.test( 'merges consecutive operations of the same type', () => {
    const orig = createTokens( [ 'A', 'B', 'C', 'D' ] ), mod = createTokens( [ 'A', 'X', 'Y', 'D' ] );
    const operations = algorithm.diff( orig, mod );

    assert.equal( assertDiffComplete( orig, mod, operations ), 4 );
    assert.deepEqual( operations.map( ( { type } ) => type ), [ 'equal', 'delete', 'insert', 'equal' ] );

    assert.equal( operations[ 1 ].original.length, 2 );
    assert.equal( operations[ 2 ].modified.length, 2 );
  } );

  await t.test( 'handles repeated token values', () => {
    const orig = createTokens( [ 'A', 'B', 'A' ] ), mod = createTokens( [ 'A', 'A', 'B' ] );
    const operations = algorithm.diff( orig, mod );

    assert.equal( assertDiffComplete( orig, mod, operations ), 2 );
  } );

  await t.test( 'compares token values independently of metadata', () => {
    const orig = [ {
      type: 'identifier', value: 'customerId', start: 0, end: 10,
      language: 'typescript', scope: 'variable'
    } ];

    const mod = [ {
      type: 'word', value: 'customerId', start: 0, end: 10,
      language: 'plain', scope: 'text'
    } ];

    const operations = algorithm.diff( orig, mod );

    assert.deepEqual( operations, [ {
      type: 'equal',
      original: { start: 0, length: 1 },
      modified: { start: 0, length: 1 }
    } ] );

    assert.equal( assertDiffComplete( orig, mod, operations ), 0 );
  } );

  await t.test( 'returns a shortest edit script for all short sequences', () => {
    const sequences = createSequences( [ 'A', 'B' ], 4 );

    for ( const o of sequences ) for ( const m of sequences ) {
      const orig = createTokens( o ), mod = createTokens( m );
      const operations = algorithm.diff( orig, mod );

      const distance = assertDiffComplete( orig, mod, operations );
      const expected = orig.length + mod.length - 2 * lcsLength( o, m );

      assert.equal( distance, expected, `${ o.join( '' ) } -> ${ m.join( '' ) }` );
    }
  } );
} );
