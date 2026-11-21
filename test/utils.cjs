const assert = require( 'node:assert/strict' );


const equals = ( a, b ) => a === b;

const editDistance = ( o, m, compare = equals ) => {
  const rows = Array.from( { length: o.length + 1 }, () => new Uint32Array( m.length + 1 ) );

  for ( let i = 0; i <= o.length; i++ ) rows[ i ][ 0 ] = i;
  for ( let i = 0; i <= m.length; i++ ) rows[ 0 ][ i ] = i;

  for ( let i = 1; i <= o.length; i++ ) for ( let j = 1; j <= m.length; j++ )
    rows[ i ][ j ] = compare( o[ i - 1 ], m[ j - 1 ] ) ? rows[ i - 1 ][ j - 1 ] :
      Math.min( rows[ i - 1 ][ j ] + 1, rows[ i ][ j - 1 ] + 1 );

  return rows[ o.length ][ m.length ];
};

const getEditDistance = ( operations ) => operations.reduce( ( d, { type, original, modified } ) =>
  d + ( type === 'equal' ? 0 : original.length + modified.length ), 0
);

const reconstruct = ( original, modified, operations, compare = equals ) => {
  const result = [];
  let oPos = 0, mPos = 0;

  for ( const { type, original: o, modified: m } of operations ) {
    assert.equal( o.start, oPos );
    assert.equal( m.start, mPos );

    assert.ok( o.length >= 0 && o.start + o.length <= original.length );
    assert.ok( m.length >= 0 && m.start + m.length <= modified.length );

    if ( type === 'equal' ) {
      assert.equal( o.length, m.length );

      for ( let i = 0; i < o.length; i++ ) assert.equal(
        compare( original[ o.start + i ], modified[ m.start + i ] ), true
      );

      result.push( ...modified.slice( m.start, m.start + m.length ) );
    } else if ( type === 'delete' ) {
      assert.equal( m.length, 0 );
    } else if ( type === 'insert' ) {
      assert.equal( o.length, 0 );
      result.push( ...modified.slice( m.start, m.start + m.length ) );
    } else {
      assert.fail( `Unknown operation type: ${ type }` );
    }

    oPos += o.length, mPos += m.length;
  }

  assert.equal( oPos, original.length );
  assert.equal( mPos, modified.length );
  assert.deepEqual( result, modified );
};


module.exports = {
  equals, reconstruct, editDistance, getEditDistance,

  diff: ( o, m, algo, compare = equals ) => algo.diff( o, m, compare ),

  assertMinimal: ( o, m, operations, compare = equals ) => {
    reconstruct( o, m, operations, compare );
    assert.equal( getEditDistance( operations ), editDistance( o, m, compare ) );
  },

  getOperationCount: ( operations, type ) => operations.filter( o => o.type === type ).length,

  getEqualLength: ( operations ) => operations.reduce( ( length, { type, original } ) =>
    length + ( type === 'equal' ? original.length : 0 ), 0
  ),

  createSequences: ( maxLength = 4, values = [ 'a', 'b' ] ) => {
    const sequences = [ [] ];

    for ( let length = 1; length <= maxLength; length++ ) {
      const count = values.length ** length;

      for ( let mask = 0; mask < count; mask++ ) {
        let value = mask;

        sequences.push( Array.from( { length }, () => {
          const element = values[ value % values.length ];
          value = Math.floor( value / values.length );

          return element;
        } ) );
      }
    }

    return sequences;
  }
};
