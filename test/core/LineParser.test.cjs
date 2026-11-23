const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );


const { LineParser } = require( '../../.test-dist/core/LineParser.js' );
const parser = new LineParser();


test( 'LineParser', async t => {
  await t.test( 'parses a single line without a line ending', () => {
    assert.deepEqual( parser.parse( 'Hello' ), [ { value: 'Hello', ending: '', start: 0, contentEnd: 5, end: 5 } ] );
  } );

  await t.test( 'parses an empty input as one empty line', () => {
    assert.deepEqual( parser.parse( '' ), [ { value: '', ending: '', start: 0, contentEnd: 0, end: 0 } ] );
  } );

  await t.test( 'parses lines separated by LF', () => {
    assert.deepEqual( parser.parse( 'First\nSecond\nThird' ), [
      { value: 'First', ending: '\n', start: 0, contentEnd: 5, end: 6 },
      { value: 'Second', ending: '\n', start: 6, contentEnd: 12, end: 13 },
      { value: 'Third', ending: '', start: 13, contentEnd: 18, end: 18 }
    ] );
  } );

  await t.test( 'parses lines separated by CRLF', () => {
    assert.deepEqual( parser.parse( 'First\r\nSecond\r\nThird' ), [
      { value: 'First', ending: '\r\n', start: 0, contentEnd: 5, end: 7 },
      { value: 'Second', ending: '\r\n', start: 7, contentEnd: 13, end: 15 },
      { value: 'Third', ending: '', start: 15, contentEnd: 20, end: 20 }
    ] );
  } );
} );
