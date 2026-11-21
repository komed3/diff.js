const assert = require( 'node:assert/strict' );


module.exports = {
  equals: ( a, b ) => a === b,

  diff: ( o, m, algo ) => algo.diff( o, m, ( a, b ) => a === b ),

  reconstruct: ( o, m, operations ) => {
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
  },
  
  editDistance: ( o, m ) => {
    const rows = Array.from( { length: o.length + 1 }, () => new Uint32Array( m.length + 1 ) );

    for ( let i = 0; i <= o.length; i++ ) rows[ i ][ 0 ] = i;
    for ( let i = 0; i <= m.length; i++ ) rows[ 0 ][ i ] = i;

    for ( let i = 1; i <= o.length; i++ ) for ( let j = 1; j <= m.length; j++ )
      rows[ i ][ j ] = o[ i - 1 ] === m[ j - 1 ] ? rows[ i - 1 ][ j - 1 ] :
        Math.min( rows[ i - 1 ][ j ] + 1, rows[ i ][ j - 1 ] + 1 );

    return rows[ o.length ][ m.length ];
  },

  getEditDistance: ( operations ) => operations.reduce( ( d, { type, original, modified } ) =>
    d + ( type === 'equal' ? 0 : original.length + modified.length ), 0
  )
};
