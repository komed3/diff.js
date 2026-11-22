const shared = require( './shared.cjs' );
const { assertMinimal, diff } = require( './utils.cjs' );


const { HuntSzymanski } = require( '../../.test-dist/algorithms/HuntSzymanski.js' );
const algorithm = new HuntSzymanski();


shared( 'HuntSzymanski', algorithm, async t => {
  await t.test( 'handles long repeated matches minimally', () => {
    const o = [ ...Array( 32 ).fill( 'a' ), 'x', ...Array( 32 ).fill( 'b' ) ];
    const m = [ ...Array( 32 ).fill( 'b' ), 'y', ...Array( 32 ).fill( 'a' ) ];

    assertMinimal( o, m, diff( o, m, algorithm ) );
  } );
} );
