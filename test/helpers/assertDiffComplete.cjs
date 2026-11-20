const assert = require( 'node:assert/strict' );


module.exports = function assertDiffComplete ( original, modified, operations ) {
  let origIndex = 0, modIndex = 0, distance = 0, prevType = null;

  for ( const operation of operations ) {
    const { type, original: source, modified: target } = operation;

    assert.equal( source.start, origIndex );
    assert.equal( target.start, modIndex );

    assert.ok( Number.isInteger( source.length ) && source.length >= 0 );
    assert.ok( Number.isInteger( target.length ) && target.length >= 0 );

    assert.ok( source.start + source.length <= original.length );
    assert.ok( target.start + target.length <= modified.length );
    assert.notEqual( type, prevType, 'Consecutive operations must be merged' );

    if ( type === 'equal' ) {
      assert.ok( source.length > 0 );
      assert.equal( source.length, target.length );

      for ( let i = 0; i < source.length; i++ )
        assert.equal( original[ origIndex + i ].value, modified[ modIndex + i ].value );

      origIndex += source.length, modIndex += target.length;
    } else if ( type === 'insert' ) {
      assert.equal( source.length, 0 );
      assert.ok( target.length > 0 );

      modIndex += target.length, distance += target.length;
    } else if ( type === 'delete' ) {
      assert.ok( source.length > 0 );
      assert.equal( target.length, 0 );

      origIndex += source.length, distance += source.length;
    } else {
      assert.fail( `Unknown operation type: ${ type }` );
    }

    prevType = type;
  }

  assert.equal( origIndex, original.length );
  assert.equal( modIndex, modified.length );

  return distance;
};
