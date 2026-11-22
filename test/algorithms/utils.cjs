const assert = require( 'node:assert/strict' );


const equals = ( a, b ) => a === b;

const diff = ( original, modified, algo, compare = equals ) => algo.diff( { original, modified, equals: compare } );

const editDistance = ( original, modified, compare = equals ) => {
  const rows = Array.from( { length: original.length + 1 }, () => new Uint32Array( modified.length + 1 ) );

  for ( let i = 0; i <= original.length; i++ ) rows[ i ][ 0 ] = i;
  for ( let i = 0; i <= modified.length; i++ ) rows[ 0 ][ i ] = i;

  for ( let i = 1; i <= original.length; i++ ) for ( let j = 1; j <= modified.length; j++ )
    rows[ i ][ j ] = compare( original[ i - 1 ], modified[ j - 1 ] ) ? rows[ i - 1 ][ j - 1 ] :
      Math.min( rows[ i - 1 ][ j ] + 1, rows[ i ][ j - 1 ] + 1 );

  return rows[ original.length ][ modified.length ];
};

const getEditDistance = ( operations ) => operations.reduce( ( dist, { type, original, modified } ) =>
  dist + ( type === 'equal' ? 0 : original.length + modified.length ), 0
);

const getOperationCount = ( operations, type ) => operations.filter( o => o.type === type ).length;

const getEqualLength = ( operations ) => operations.reduce( ( length, { type, original } ) =>
  length + ( type === 'equal' ? original.length : 0 ), 0
);

const reconstruct = ( original, modified, operations, compare = equals ) => {
  const result = [];
  let oPos = 0, mPos = 0;

  for ( const { type, original: o, modified: m } of operations ) {
    assert.equal( o.start, oPos );
    assert.equal( m.start, mPos );

    assert.ok( o.length >= 0 && o.start + o.length <= original.length );
    assert.ok( m.length >= 0 && m.start + m.length <= modified.length );

    switch ( type ) {
      case 'equal':
        assert.equal( o.length, m.length );
        for ( let i = 0; i < o.length; i++ ) assert.equal( compare( original[ o.start + i ], modified[ m.start + i ] ), true );
        result.push( ...modified.slice( m.start, m.start + m.length ) );
        break;

      case 'delete':
        assert.equal( m.length, 0 );
        break;

      case 'insert':
        assert.equal( o.length, 0 );
        result.push( ...modified.slice( m.start, m.start + m.length ) );
        break;

      default:
        assert.fail( `Unknown operation type: ${ type }` );
    }

    if ( type !== 'insert' ) oPos += o.length;
    if ( type !== 'delete' ) mPos += m.length;
  }

  assert.equal( oPos, original.length );
  assert.equal( mPos, modified.length );
  assert.deepEqual( result, modified );
};

const assertMinimal = ( o, m, operations, compare = equals ) => {
  reconstruct( o, m, operations, compare );
  assert.equal( getEditDistance( operations ), editDistance( o, m, compare ) );
};

const createSequences = ( maxLength = 4, values = [ 'a', 'b' ] ) => {
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
};


module.exports = {
  equals, diff, reconstruct, editDistance, getEditDistance,
  getOperationCount, getEqualLength, assertMinimal, createSequences
};
