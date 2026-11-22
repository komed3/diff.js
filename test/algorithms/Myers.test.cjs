const shared = require( './shared.cjs' );
const { assertMinimal, diff } = require( './utils.cjs' );


const { Myers } = require( '../../.test-dist/algorithms/Myers.js' );
const algorithm = new Myers();


shared( 'Myers', algorithm, async t => {
  await t.test( 'handles large common prefixes and suffixes', () => {
    const o = [ ...Array( 1000 ).fill( 'same' ), 'old', ...Array( 1000 ).fill( 'same' ) ];
    const m = [ ...Array( 1000 ).fill( 'same' ), 'new', ...Array( 1000 ).fill( 'same' ) ];

    assertMinimal( o, m, diff( o, m, algorithm ) );
  } );
} );
