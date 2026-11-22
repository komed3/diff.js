const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );

const { diff, reconstruct, createSequences } = require( './utils.cjs' );


module.exports = ( name, algorithm ) => {
  const d = ( o, m ) => diff( o, m, algorithm );

  test( name, async t => {
    await t.test( 'handles two empty sequences', () => {
      assert.deepEqual( d( [], [] ), [] );
    } );

    await t.test( 'handles an empty original sequence', () => {
      const original = [], modified = [ 'a', 'b', 'c' ];
      const operations = d( original, modified );

      assert.deepEqual( operations, [
        { type: 'insert', original: { start: 0, length: 0 }, modified: { start: 0, length: 3 } }
      ] );

      reconstruct( original, modified, operations );
    } );

    await t.test( 'handles an empty modified sequence', () => {
      const original = [ 'a', 'b', 'c' ], modified = [];
      const operations = d( original, modified );

      assert.deepEqual( operations, [
        { type: 'delete', original: { start: 0, length: 3 }, modified: { start: 0, length: 0 } }
      ] );

      reconstruct( original, modified, operations );
    } );

    await t.test( 'handles identical sequences', () => {
      const original = [ 'a', 'b', 'c' ], modified = [ 'a', 'b', 'c' ];
      const operations = d( original, modified );

      assert.deepEqual( operations, [
        { type: 'equal', original: { start: 0, length: 3 }, modified: { start: 0, length: 3 } }
      ] );

      reconstruct( original, modified, operations );
    } );

    await t.test( 'detects insertions at the beginning and middle', () => {
      const cases = [ [ [ 'b', 'c' ], [ 'a', 'b', 'c' ] ], [ [ 'a', 'c' ], [ 'a', 'b', 'c' ] ] ];
      for ( const [ o, m ] of cases ) reconstruct( o, m, d( o, m ) );
    } );

    await t.test( 'detects a deletion', () => {
      const original = [ 'a', 'b', 'c' ], modified = [ 'a', 'c' ];
      reconstruct( original, modified, d( original, modified ) );
    } );

    await t.test( 'represents a replacement as delete and insert', () => {
      const original = [ 'a', 'b', 'c' ], modified = [ 'a', 'x', 'c' ];
      const operations = d( original, modified );

      reconstruct( original, modified, operations );
      assert.equal( operations.some( o => o.type === 'delete' ), true );
      assert.equal( operations.some( o => o.type === 'insert' ), true );
    } );

    await t.test( 'handles repeated elements', () => {
      const original = [ 'a', 'a', 'a', 'a', 'a', 'a' ], modified = [ 'a', 'a', 'b', 'a', 'a', 'a' ];
      reconstruct( original, modified, d( original, modified ) );
    } );

    await t.test( 'handles multiple separated changes', () => {
      const original = [ 'a', 'b', 'c', 'd', 'e' ], modified = [ 'a', 'x', 'c', 'y', 'e' ];
      reconstruct( original, modified, d( original, modified ) );
    } );

    await t.test( 'uses the supplied equality function', () => {
      const original = [ 'Alpha', 'Beta' ], modified = [ 'alpha', 'BETA' ];
      const compare = ( a, b ) => a.toLowerCase() === b.toLowerCase();
      const operations = diff( original, modified, algorithm, compare );

      assert.deepEqual( operations, [
        { type: 'equal', original: { start: 0, length: 2 }, modified: { start: 0, length: 2 } }
      ] );

      reconstruct( original, modified, operations, compare );
    } );

    await t.test( 'does not modify input sequences', () => {
      const original = [ 'a', 'b', 'c' ], modified = [ 'a', 'x', 'c' ];
      const originalCopy = [ ...original ], modifiedCopy = [ ...modified ];

      d( original, modified );
      assert.deepEqual( original, originalCopy );
      assert.deepEqual( modified, modifiedCopy );
    } );

    await t.test( 'produces valid edit scripts for short sequences', () => {
      const sequences = createSequences();

      for ( const original of sequences ) for ( const modified of sequences )
        reconstruct( original, modified, d( original, modified ) );
    } );
  } );
};
