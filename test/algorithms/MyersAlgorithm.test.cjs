const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );

const { MyersAlgorithm } = require( '../../.test-dist/algorithms/MyersAlgorithm.js' );


const algorithm = new MyersAlgorithm();

const equals = ( a, b ) => a === b;
const diff = ( o, m ) => algorithm.diff( o, m, equals );

const reconstruct = ( o, m, operations ) => {
  const result = operations.map( ( { type, original, modified } ) => {
    if ( type === 'equal' ) {
      assert.equal( original.length, modified.length );
      assert.deepEqual(
        o.slice( original.start, original.start + original.length ),
        m.slice( modified.start, modified.start + modified.length )
      );

      return o.slice( original.start, original.start + original.length );
    }

    if ( type === 'delete' ) {
      assert.equal( modified.length, 0 );
      return [];
    }

    assert.equal( original.length, 0 );
    return m.slice( modified.start, modified.start + modified.length );
  } );

  assert.deepEqual( result.flat(), m );

  let oPos = 0, mPos = 0;

  for ( const { original, modified } of operations ) {
    assert.equal( original.start, oPos );
    assert.equal( modified.start, mPos );

    oPos += original.length, mPos += modified.length;
  }

  assert.equal( oPos, o.length );
  assert.equal( mPos, m.length );
};
