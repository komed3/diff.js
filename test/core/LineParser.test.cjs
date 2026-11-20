const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );

const { LineParser } = require( '../../.test-dist/core/LineParser.js' );


test( 'LineParser', async t => {
  const parser = new LineParser();

  await t.test( 'returns an empty array for empty text', () => {
    assert.deepEqual( parser.parse( '' ), [] );
  } );

  await t.test( 'parses a single line without an ending', () => {
    assert.deepEqual( parser.parse( 'alpha' ), [
      { value: 'alpha', ending: '', start: 0, contentEnd: 5, end: 5 }
    ] );
  } );

  await t.test( 'parses all supported line endings', () => {
    for ( const ending of [ '\n', '\r\n', '\r', '\u2028', '\u2029' ] ) {
      assert.deepEqual( parser.parse( `alpha${ ending }` ), [
        { value: 'alpha', ending, start: 0, contentEnd: 5, end: 5 + ending.length }
      ] );
    }
  } );

  await t.test( 'parses multiple lines with the same ending', () => {
    assert.deepEqual( parser.parse( 'alpha\nbeta\ngamma' ), [
      { value: 'alpha', ending: '\n', start: 0, contentEnd: 5, end: 6 },
      { value: 'beta', ending: '\n', start: 6, contentEnd: 10, end: 11 },
      { value: 'gamma', ending: '', start: 11, contentEnd: 16, end: 16 }
    ] );
  } );

  await t.test( 'parses mixed line endings', () => {
    assert.deepEqual( parser.parse( 'alpha\r\nbeta\ngamma\rdelta\u2028epsilon\u2029' ), [
      { value: 'alpha', ending: '\r\n', start: 0, contentEnd: 5, end: 7 },
      { value: 'beta', ending: '\n', start: 7, contentEnd: 11, end: 12 },
      { value: 'gamma', ending: '\r', start: 12, contentEnd: 17, end: 18 },
      { value: 'delta', ending: '\u2028', start: 18, contentEnd: 23, end: 24 },
      { value: 'epsilon', ending: '\u2029', start: 24, contentEnd: 31, end: 32 }
    ] );
  } );

  await t.test( 'preserves empty lines', () => {
    assert.deepEqual( parser.parse( '\n\n\n' ), [
      { value: '', ending: '\n', start: 0, contentEnd: 0, end: 1 },
      { value: '', ending: '\n', start: 1, contentEnd: 1, end: 2 },
      { value: '', ending: '\n', start: 2, contentEnd: 2, end: 3 }
    ] );
  } );

  await t.test( 'does not create an additional line after a trailing ending', () => {
    assert.deepEqual( parser.parse( 'alpha\n\n' ), [
      { value: 'alpha', ending: '\n', start: 0, contentEnd: 5, end: 6 },
      { value: '', ending: '\n', start: 6, contentEnd: 6, end: 7 }
    ] );
  } );

  await t.test( 'handles consecutive carriage returns independently', () => {
    assert.deepEqual( parser.parse( 'alpha\r\rbeta' ), [
      { value: 'alpha', ending: '\r', start: 0, contentEnd: 5, end: 6 },
      { value: '', ending: '\r', start: 6, contentEnd: 6, end: 7 },
      { value: 'beta', ending: '', start: 7, contentEnd: 11, end: 11 }
    ] );
  } );

  await t.test( 'handles Unicode characters and UTF-16 offsets', () => {
    assert.deepEqual( parser.parse( '😀alpha\nβeta' ), [
      { value: '😀alpha', ending: '\n', start: 0, contentEnd: 7, end: 8 },
      { value: 'βeta', ending: '', start: 8, contentEnd: 12, end: 12 }
    ] );
  } );

  await t.test( 'preserves the complete source through line ranges', () => {
    const text = 'alpha\r\nbeta\u2028gamma\ndelta\r', lines = parser.parse( text );
    assert.equal( lines.map( ( { value, ending } ) => value + ending ).join( '' ), text );
  } );
} );
