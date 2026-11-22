const shared = require( './shared.cjs' );
const { diff, assertMinimal, createSequences } = require( './utils.cjs' );

const { Myers } = require( '../../.test-dist/algorithms/Myers.js' );
const algorithm = new Myers();


shared( 'Myers', algorithm );

require( 'node:test' )( 'Myers minimality', async t => {
  await t.test( 'produces minimal edit scripts for short sequences', () => {
    const sequences = createSequences();

    for ( const original of sequences ) for ( const modified of sequences )
      assertMinimal( original, modified, diff( original, modified, algorithm ) );
  } );

  await t.test( 'handles large common prefixes and suffixes', () => {
    const original = [ ...Array( 1000 ).fill( 'same' ), 'old', ...Array( 1000 ).fill( 'same' ) ];
    const modified = [ ...Array( 1000 ).fill( 'same' ), 'new', ...Array( 1000 ).fill( 'same' ) ];

    assertMinimal( original, modified, diff( original, modified, algorithm ) );
  } );
} );
