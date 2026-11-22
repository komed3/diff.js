const shared = require( './shared.cjs' );
const { diff, assertMinimal, createSequences } = require( './utils.cjs' );


const { Myers } = require( '../../.test-dist/algorithms/Myers.js' );
const algorithm = new Myers();


shared( 'Myers', algorithm, async t => {
  await t.test( 'produces minimal edit scripts for short sequences', () => {
    const seqs = createSequences();
    for ( const o of seqs ) for ( const m of seqs ) assertMinimal( o, m, diff( o, m, algorithm ) );
  } );

  await t.test( 'handles large common prefixes and suffixes', () => {
    const o = [ ...Array( 1000 ).fill( 'same' ), 'old', ...Array( 1000 ).fill( 'same' ) ];
    const m = [ ...Array( 1000 ).fill( 'same' ), 'new', ...Array( 1000 ).fill( 'same' ) ];

    assertMinimal( o, m, diff( o, m, algorithm ) );
  } );
} );
