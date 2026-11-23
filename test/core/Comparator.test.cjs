const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );


const { COMPARATORS } = require( '../../.test-dist/core/Comparator.js' );

const cases = {
  exact: [ [ 'text', 'text', true ], [ 'text', 'Text', false ] ],
  whitespace: [ [ 'two words', 'two \t words', true ], [ 'two words', 'tw o words', true ], [ 'two words', 'three words', false ] ],
  collapsedWhitespace: [ [ '  two\t\n words ', 'two words', true ], [ 'tw o words', 'two words', false ] ],
  trimmed: [ [ '  text\t', 'text', true ], [ 'text', 'text ', true ], [ 'text', 'other', false ] ],
  caseInsensitive: [ [ 'Text', 'text', true ], [ 'TEXT', 'different', false ] ],
  unicode: [ [ 'Cafe\u0301', 'Caf\u00e9', true ], [ 'Cafe\u0301', 'Cafe', false ] ]
};
