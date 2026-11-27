const shared = require( './shared.cjs' );
const { assertMinimal, diff } = require( './utils.cjs' );


const { Myers } = require( '../../dist/cjs/algorithms/Myers.js' );
const algorithm = new Myers();


shared( 'Myers', algorithm, async t => {
  await t.test( 'handles large common prefixes and suffixes', () => {
    const o = [ ...Array( 1000 ).fill( 'same' ), 'old', ...Array( 1000 ).fill( 'same' ) ];
    const m = [ ...Array( 1000 ).fill( 'same' ), 'new', ...Array( 1000 ).fill( 'same' ) ];

    assertMinimal( o, m, diff( o, m, algorithm ) );
  } );

  await t.test( 'produces minimal scripts with repeated tokens', () => {
    const o = [ 'a', 'b', 'c', 'a', 'b', 'c' ], m = [ 'b', 'c', 'a', 'c', 'a', 'b' ];
    assertMinimal( o, m, diff( o, m, algorithm ) );
  } );

  await t.test( 'produces minimal scripts with a custom equality function', () => {
    const o = [ { id: 'a' }, { id: 'b' }, { id: 'a' } ];
    const m = [ { id: 'b' }, { id: 'a' }, { id: 'c' } ];
    const equals = ( a, b ) => a.id === b.id;

    assertMinimal( o, m, diff( o, m, algorithm, equals ), equals );
  } );
} );

