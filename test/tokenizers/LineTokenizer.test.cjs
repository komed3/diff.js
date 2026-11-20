const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );

const { LineTokenizer } = require( '../../.test-dist/tokenizers/LineTokenizer.js' );
const assertTokenComplete = require( '../helpers/assertTokenComplete.cjs' );


test( 'LineTokenizer', async t => {
  const tokenizer = new LineTokenizer();

  await t.test( 'separates lines using different line endings', () => {
    const text = 'First\nSecond\r\nThird\rFourth\u2028Fifth\u2029';
    const tokens = tokenizer.tokenize( text );

    assert.deepEqual( tokens.map( ( { value } ) => value ), [
      'First\n', 'Second\r\n', 'Third\r', 'Fourth\u2028', 'Fifth\u2029'
    ] );

    assertTokenComplete( text, tokens );
  } );

  await t.test( 'preserves empty lines', () => {
    const text = 'First\n\nThird', tokens = tokenizer.tokenize( text );

    assert.deepEqual( tokens.map( ( { value } ) => value ), [ 'First\n', '\n', 'Third' ] );
    assertTokenComplete( text, tokens );
  } );

  await t.test( 'preserves a trailing line ending', () => {
    const text = 'First\n', tokens = tokenizer.tokenize( text );

    assert.deepEqual( tokens.map( ( { value } ) => value ), [ 'First\n' ] );
    assertTokenComplete( text, tokens );
  } );

  await t.test( 'handles empty input', () => {
    assert.deepEqual( tokenizer.tokenize( '' ), [] );
  } );

  await t.test( 'can tokenize multiple texts consecutively', () => {
    assertTokenComplete( 'First\nSecond', tokenizer.tokenize( 'First\nSecond' ) );
    assertTokenComplete( 'Third\r\nFourth', tokenizer.tokenize( 'Third\r\nFourth' ) );
    assertTokenComplete( 'Fifth', tokenizer.tokenize( 'Fifth' ) );
  } );
} );
