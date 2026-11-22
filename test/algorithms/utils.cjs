const assert = require( 'node:assert/strict' );


const equals = ( n, m ) => n === m;
const diff = ( o, m, algo, c = equals ) => algo.diff( { original: o, modified: m, equals: c } );
const getOperationCount = ( ops, type ) => ops.filter( o => o.type === type ).length;

const getEqualLength = ( ops ) => ops.reduce( ( len, { type, original } ) =>
  len + ( type === 'equal' ? original.length : 0 ), 0 );

const getEditDistance = ops => ops.reduce( ( n, { type, original, modified } ) =>
  n + ( type === 'equal' ? 0 : original.length + modified.length ), 0 );

const editDistance = ( o, m, c = equals ) => {
  const rows = Array.from( { length: o.length + 1 }, () => new Uint32Array( m.length + 1 ) );

  for ( let i = 0; i <= o.length; i++ ) rows[ i ][ 0 ] = i;
  for ( let i = 0; i <= m.length; i++ ) rows[ 0 ][ i ] = i;

  for ( let i = 1; i <= o.length; i++ ) for ( let j = 1; j <= m.length; j++ )
    rows[ i ][ j ] = c( o[ i - 1 ], m[ j - 1 ] ) ? rows[ i - 1 ][ j - 1 ] :
      Math.min( rows[ i - 1 ][ j ] + 1, rows[ i ][ j - 1 ] + 1 );

  return rows[ o.length ][ m.length ];
};

const reconstruct = ( o, m, ops, c = equals ) => {
  const result = [];
  let oPos = 0, mPos = 0;

  for ( const { type, original: oi, modified: mi } of ops ) {
    assert.equal( oi.start, oPos );
    assert.equal( mi.start, mPos );
    assert.ok( oi.length >= 0 && oi.start + oi.length <= o.length );
    assert.ok( mi.length >= 0 && mi.start + mi.length <= m.length );

    switch ( type ) {
      case 'equal':
        assert.equal( oi.length, mi.length );
        for ( let i = 0; i < oi.length; i++ ) assert.equal( c( o[ oi.start + i ], m[ mi.start + i ] ), true );
        result.push( ...m.slice( mi.start, mi.start + mi.length ) );
        break;

      case 'delete':
        assert.equal( mi.length, 0 );
        break;

      case 'insert':
        assert.equal( oi.length, 0 );
        result.push( ...m.slice( mi.start, mi.start + mi.length ) );
        break;

      default:
        assert.fail( `Unknown operation type: ${ type }` );
    }

    oPos += oi.length, mPos += mi.length;
  }

  assert.equal( oPos, o.length );
  assert.equal( mPos, m.length );
  assert.deepEqual( result, m );
};

const assertMinimal = ( o, m, ops, c = equals ) => {
  reconstruct( o, m, ops, c );
  assert.equal( getEditDistance( ops ), editDistance( o, m, c ) );
};

const createSequences = ( max = 4, values = [ 'a', 'b' ] ) => {
  const seqs = [ [] ];

  for ( let n = 0; n < max; n++ ) {
    const prefixes = seqs.filter( s => s.length === n );
    seqs.push( ...values.flatMap( v => prefixes.map( p => [ ...p, v ] ) ) );
  }

  return seqs;
};


module.exports = {
  equals, diff, reconstruct, editDistance, getOperationCount,
  getEqualLength, getEditDistance, assertMinimal, createSequences
};
