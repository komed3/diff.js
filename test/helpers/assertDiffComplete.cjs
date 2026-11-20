const assert = require( 'node:assert/strict' );


module.exports = function assertDiffComplete ( original, modified, operations ) {
  let originalIndex = 0, modifiedIndex = 0, distance = 0;

  for ( const operation of operations ) {
    const { type, original: source, modified: target } = operation;

    assert.equal( source.start, originalIndex );
    assert.equal( target.start, modifiedIndex );

    assert.ok( Number.isInteger( source.length ) && source.length >= 0 );
    assert.ok( Number.isInteger( target.length ) && target.length >= 0 );

    if ( type === 'equal' ) {
      assert.ok( source.length > 0 );
      assert.equal( source.length, target.length );

      for ( let i = 0; i < source.length; i++ ) assert.equal(
        original[ originalIndex + i ].value, modified[ modifiedIndex + i ].value
      );

      originalIndex += source.length, modifiedIndex += target.length;
    } else if ( type === 'insert' ) {
      assert.equal( source.length, 0 );
      assert.ok( target.length > 0 );

      modifiedIndex += target.length, distance += target.length;
    } else if ( type === 'delete' ) {
      assert.ok( source.length > 0 );
      assert.equal( target.length, 0 );

      originalIndex += source.length, distance += source.length;
    } else {
      assert.fail( `Unknown operation type: ${ type }` );
    }
  }

  assert.equal( originalIndex, original.length );
  assert.equal( modifiedIndex, modified.length );

  return distance;
};
