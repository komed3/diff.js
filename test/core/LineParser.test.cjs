const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );


const { LineParser } = require( '../../.test-dist/core/LineParser.js' );
const parser = new LineParser();


test( 'LineParser', async t => {
  await t.test( 'parses a single line without a line ending', () => {
    assert.deepEqual( parser.parse( 'Hello' ), [ {
      value: 'Hello', ending: '', start: 0, contentEnd: 5, end: 5
    } ] );
  } );

  await t.test( 'parses an empty input as one empty line', () => {
    assert.deepEqual( parser.parse( '' ), [ {
      value: '', ending: '', start: 0, contentEnd: 0, end: 0
    } ] );
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

  await t.test( 'parses lines separated by CR', () => {
    assert.deepEqual( parser.parse( 'First\rSecond\rThird' ), [
      { value: 'First', ending: '\r', start: 0, contentEnd: 5, end: 6 },
      { value: 'Second', ending: '\r', start: 6, contentEnd: 12, end: 13 },
      { value: 'Third', ending: '', start: 13, contentEnd: 18, end: 18 }
    ] );
  } );

  await t.test( 'supports Unicode line separators', () => {
    assert.deepEqual( parser.parse( 'First\u2028Second\u2029Third' ), [
      { value: 'First', ending: '\u2028', start: 0, contentEnd: 5, end: 6 },
      { value: 'Second', ending: '\u2029', start: 6, contentEnd: 12, end: 13 },
      { value: 'Third', ending: '', start: 13, contentEnd: 18, end: 18 }
    ] );
  } );

  await t.test( 'preserves empty lines', () => {
    assert.deepEqual( parser.parse( 'First\n\nThird' ), [
      { value: 'First', ending: '\n', start: 0, contentEnd: 5, end: 6 },
      { value: '', ending: '\n', start: 6, contentEnd: 6, end: 7 },
      { value: 'Third', ending: '', start: 7, contentEnd: 12, end: 12 }
    ] );
  } );

  await t.test( 'preserves a trailing line ending without adding a phantom line', () => {
    assert.deepEqual( parser.parse( 'First\n' ), [
      { value: 'First', ending: '\n', start: 0, contentEnd: 5, end: 6 }
    ] );
  } );

  await t.test( 'preserves multiple trailing line endings', () => {
    assert.deepEqual( parser.parse( 'First\n\n' ), [
      { value: 'First', ending: '\n', start: 0, contentEnd: 5, end: 6 },
      { value: '', ending: '\n', start: 6, contentEnd: 6, end: 7 }
    ] );
  } );

  await t.test( 'treats CRLF as one line ending', () => {
    assert.deepEqual( parser.parse( '\r\n' ), [
      { value: '', ending: '\r\n', start: 0, contentEnd: 0, end: 2 }
    ] );
  } );
} );
