const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );


const { COMPARATORS } = require( '../../dist/core/Comparator.js' );


const cases = {
  exact: [ [ 'text', 'text', true ], [ 'text', 'Text', false ] ],
  whitespace: [ [ 'two words', 'two \t words', true ], [ 'two words', 'tw o words', true ], [ 'two words', 'three words', false ] ],
  collapsedWhitespace: [ [ '  two\t\n words ', 'two words', true ], [ 'tw o words', 'two words', false ] ],
  trimmed: [ [ '  text\t', 'text', true ], [ 'text', 'text ', true ], [ 'text', 'other', false ] ],
  caseInsensitive: [ [ 'Text', 'text', true ], [ 'TEXT', 'different', false ] ],
  unicode: [ [ 'Cafe\u0301', 'Caf\u00e9', true ], [ 'Cafe\u0301', 'Cafe', false ] ]
};


test( 'COMPARATORS', async t => {
  for ( const [ name, factory ] of Object.entries( COMPARATORS ) ) {
    await t.test( `supports ${ name }`, () => {
      const { equals, key } = factory();

      assert.ok( Object.hasOwn( cases, name ) );
      assert.ok( equals );
      assert.ok( key );

      for ( const [ a, b, equal ] of cases[ name ] ) {
        const o = { value: a }, m = { value: b };

        assert.equal( equals( o, m ), equal );
        assert.equal( equals( m, o ), equal );
        assert.equal( key( o ) === key( m ), equal );
      }
    } );
  }

  await t.test( 'compares line endings by default', () => {
    const comparator = COMPARATORS.exact();
    const original = { value: 'text', ending: '\n', offset: 0, contentEnd: 4, end: 5 };
    const modified = { value: 'text', ending: '\r\n', offset: 0, contentEnd: 4, end: 6 };

    assert.equal( comparator.equals( original, modified ), false );
    assert.notEqual( comparator.key( original ), comparator.key( modified ) );
  } );

  await t.test( 'can ignore line endings', () => {
    const comparator = COMPARATORS.exact( { lineEndings: false } );
    const original = { value: 'text', ending: '\n', offset: 0, contentEnd: 4, end: 5 };
    const modified = { value: 'text', ending: '\r\n', offset: 0, contentEnd: 4, end: 6 };

    assert.equal( comparator.equals( original, modified ), true );
    assert.equal( comparator.key( original ), comparator.key( modified ) );
  } );

  await t.test( 'creates unambiguous keys', () => {
    const comparator = COMPARATORS.exact();

    const a = { value: 'x', ending: 'y', offset: 0, contentEnd: 1, end: 2 };
    const b = { value: 'xy', ending: '', offset: 0, contentEnd: 2, end: 2 };

    assert.notEqual( comparator.key( a ), comparator.key( b ) );
  } );

  await t.test( 'does not treat token metadata as line endings', () => {
    const comparator = COMPARATORS.exact();

    const original = { value: 'text', ending: '\n' };
    const modified = { value: 'text', ending: '\r\n' };

    assert.equal( comparator.equals( original, modified ), true );
    assert.equal( comparator.key( original ), comparator.key( modified ) );
  } );
} );
