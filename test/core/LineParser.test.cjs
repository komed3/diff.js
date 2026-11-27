const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );


const { LineParser } = require( '../../dist/core/LineParser.js' );
const parser = new LineParser();


test( 'LineParser', async t => {
  await t.test( 'parses a single line without a line ending', () => {
    assert.deepEqual( parser.parse( 'Hello' ), [
      { value: 'Hello', ending: '', offset: 0, contentEnd: 5, end: 5 }
    ] );
  } );

  await t.test( 'parses an empty input without lines', () => {
    assert.deepEqual( parser.parse( '' ), [] );
  } );

  await t.test( 'parses an empty line', () => {
    assert.deepEqual( parser.parse( '\n' ), [
      { value: '', ending: '\n', offset: 0, contentEnd: 0, end: 1 }
    ] );
  } );

  await t.test( 'parses lines separated by LF', () => {
    assert.deepEqual( parser.parse( 'First\nSecond\nThird' ), [
      { value: 'First', ending: '\n', offset: 0, contentEnd: 5, end: 6 },
      { value: 'Second', ending: '\n', offset: 6, contentEnd: 12, end: 13 },
      { value: 'Third', ending: '', offset: 13, contentEnd: 18, end: 18 }
    ] );
  } );

  await t.test( 'parses lines separated by CRLF', () => {
    assert.deepEqual( parser.parse( 'First\r\nSecond\r\nThird' ), [
      { value: 'First', ending: '\r\n', offset: 0, contentEnd: 5, end: 7 },
      { value: 'Second', ending: '\r\n', offset: 7, contentEnd: 13, end: 15 },
      { value: 'Third', ending: '', offset: 15, contentEnd: 20, end: 20 }
    ] );
  } );

  await t.test( 'parses lines separated by CR', () => {
    assert.deepEqual( parser.parse( 'First\rSecond\rThird' ), [
      { value: 'First', ending: '\r', offset: 0, contentEnd: 5, end: 6 },
      { value: 'Second', ending: '\r', offset: 6, contentEnd: 12, end: 13 },
      { value: 'Third', ending: '', offset: 13, contentEnd: 18, end: 18 }
    ] );
  } );

  await t.test( 'supports Unicode line separators', () => {
    assert.deepEqual( parser.parse( 'First\u2028Second\u2029Third' ), [
      { value: 'First', ending: '\u2028', offset: 0, contentEnd: 5, end: 6 },
      { value: 'Second', ending: '\u2029', offset: 6, contentEnd: 12, end: 13 },
      { value: 'Third', ending: '', offset: 13, contentEnd: 18, end: 18 }
    ] );
  } );

  await t.test( 'preserves empty lines', () => {
    assert.deepEqual( parser.parse( 'First\n\nThird' ), [
      { value: 'First', ending: '\n', offset: 0, contentEnd: 5, end: 6 },
      { value: '', ending: '\n', offset: 6, contentEnd: 6, end: 7 },
      { value: 'Third', ending: '', offset: 7, contentEnd: 12, end: 12 }
    ] );
  } );

  await t.test( 'preserves a trailing line ending without adding a phantom line', () => {
    assert.deepEqual( parser.parse( 'First\n' ), [
      { value: 'First', ending: '\n', offset: 0, contentEnd: 5, end: 6 }
    ] );
  } );

  await t.test( 'preserves multiple trailing line endings', () => {
    assert.deepEqual( parser.parse( 'First\n\n' ), [
      { value: 'First', ending: '\n', offset: 0, contentEnd: 5, end: 6 },
      { value: '', ending: '\n', offset: 6, contentEnd: 6, end: 7 }
    ] );
  } );

  await t.test( 'treats CRLF as one line ending', () => {
    assert.deepEqual( parser.parse( '\r\n' ), [
      { value: '', ending: '\r\n', offset: 0, contentEnd: 0, end: 2 }
    ] );
  } );

  await t.test( 'handles consecutive line endings', () => {
    assert.deepEqual( parser.parse( '\n\r\n\r' ), [
      { value: '', ending: '\n', offset: 0, contentEnd: 0, end: 1 },
      { value: '', ending: '\r\n', offset: 1, contentEnd: 1, end: 3 },
      { value: '', ending: '\r', offset: 3, contentEnd: 3, end: 4 }
    ] );
  } );

  await t.test( 'uses UTF-16 offsets', () => {
    assert.deepEqual( parser.parse( '😀\nA' ), [
      { value: '😀', ending: '\n', offset: 0, contentEnd: 2, end: 3 },
      { value: 'A', ending: '', offset: 3, contentEnd: 4, end: 4 }
    ] );
  } );
} );
