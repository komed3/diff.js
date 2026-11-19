const assert = require( 'node:assert/strict' );


module.exports = function assertComplete ( text, tokens ) {
  assert.equal( tokens.map( ( { value } ) => value ).join( '' ), text );

  let offset = 0;

  for ( const token of tokens ) {
    assert.equal( token.start, offset );
    assert.equal( token.end, offset + token.value.length );

    offset = token.end;
  }

  assert.equal( offset, text.length );
};
