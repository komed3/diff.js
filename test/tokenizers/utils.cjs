const assert = require( 'node:assert/strict' );


module.exports = {
  assertTokenComplete ( text, tokens ) {
    assert.equal( tokens.map( ( { value } ) => value ).join( '' ), text );

    let offset = 0;

    for ( const { value, start, end } of tokens ) {
      assert.equal( start, offset );
      assert.equal( end, offset + value.length );

      offset = end;
    }

    assert.equal( offset, text.length );
  }
};
