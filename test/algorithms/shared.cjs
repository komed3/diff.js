const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );

const { diff, reconstruct, createSequences } = require( './utils.cjs' );


module.exports = ( name, algorithm, additionalTests = async () => {} ) => {
  const d = ( o, m ) => diff( o, m, algorithm );

  test( name, async t => {
    await t.test( 'handles two empty sequences', () => {
      assert.deepEqual( d( [], [] ), [] );
    } );

    await t.test( 'handles an empty original sequence', () => {
      const o = [], m = [ 'a', 'b', 'c' ], ops = d( o, m );

      assert.deepEqual( ops, [ { type: 'insert', original: { start: 0, length: 0 }, modified: { start: 0, length: 3 } } ] );
      reconstruct( o, m, ops );
    } );

    await t.test( 'handles an empty modified sequence', () => {
      const o = [ 'a', 'b', 'c' ], m = [], ops = d( o, m );

      assert.deepEqual( ops, [ { type: 'delete', original: { start: 0, length: 3 }, modified: { start: 0, length: 0 } } ] );
      reconstruct( o, m, ops );
    } );

    await t.test( 'handles identical sequences', () => {
      const o = [ 'a', 'b', 'c' ], m = [ 'a', 'b', 'c' ], ops = d( o, m );

      assert.deepEqual( ops, [ { type: 'equal', original: { start: 0, length: 3 }, modified: { start: 0, length: 3 } } ] );
      reconstruct( o, m, ops );
    } );

    await t.test( 'detects insertions at the beginning and middle', () => {
      const cases = [ [ [ 'b', 'c' ], [ 'a', 'b', 'c' ] ], [ [ 'a', 'c' ], [ 'a', 'b', 'c' ] ] ];
      for ( const [ o, m ] of cases ) reconstruct( o, m, d( o, m ) );
    } );

    await t.test( 'detects a deletion', () => {
      const o = [ 'a', 'b', 'c' ], m = [ 'a', 'c' ];
      reconstruct( o, m, d( o, m ) );
    } );

    await t.test( 'represents a replacement as delete and insert', () => {
      const o = [ 'a', 'b', 'c' ], m = [ 'a', 'x', 'c' ], ops = d( o, m );

      reconstruct( o, m, ops );
      assert.equal( ops.some( ( { type } ) => type === 'delete' ), true );
      assert.equal( ops.some( ( { type } ) => type === 'insert' ), true );
    } );

    await t.test( 'handles repeated elements', () => {
      const o = [ 'a', 'a', 'a', 'a', 'a', 'a' ], m = [ 'a', 'a', 'b', 'a', 'a', 'a' ];
      reconstruct( o, m, d( o, m ) );
    } );

    await t.test( 'handles multiple separated changes', () => {
      const o = [ 'a', 'b', 'c', 'd', 'e' ], m = [ 'a', 'x', 'c', 'y', 'e' ];
      reconstruct( o, m, d( o, m ) );
    } );

    await t.test( 'uses the supplied equality function', () => {
      const o = [ 'Alpha', 'Beta' ], m = [ 'alpha', 'BETA' ];
      const compare = ( a, b ) => a.toLowerCase() === b.toLowerCase();
      const ops = diff( o, m, algorithm, compare );

      assert.deepEqual( ops, [ { type: 'equal', original: { start: 0, length: 2 }, modified: { start: 0, length: 2 } } ] );
      reconstruct( o, m, ops, compare );
    } );

    await t.test( 'does not modify input sequences', () => {
      const o = [ 'a', 'b', 'c' ], oc = [ ...o ], m = [ 'a', 'x', 'c' ], mc = [ ...m ];

      d( o, m );
      assert.deepEqual( o, oc );
      assert.deepEqual( m, mc );
    } );

    await t.test( 'produces valid edit scripts for short sequences', () => {
      const seqs = createSequences();
      for ( const o of seqs ) for ( const m of seqs ) reconstruct( o, m, d( o, m ) );
    } );

    await additionalTests( t );
  } );
};
