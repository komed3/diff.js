const shared = require( './shared.cjs' );
const { diff, assertMinimal, createSequences } = require( './utils.cjs' );

const { HuntSzymanski } = require( '../../.test-dist/algorithms/HuntSzymanski.js' );
const algorithm = new HuntSzymanski();


shared( 'HuntSzymanski', algorithm );

require( 'node:test' )( 'HuntSzymanski minimality', async t => {
  await t.test( 'produces minimal edit scripts for short sequences', () => {
    const sequences = createSequences();

    for ( const original of sequences ) for ( const modified of sequences )
      assertMinimal( original, modified, diff( original, modified, algorithm ) );
  } );
} );
