const shared = require( './shared.cjs' );
const { assertMinimal, diff } = require( './utils.cjs' );


const { HuntSzymanski } = require( '../../dist/algorithms/HuntSzymanski.js' );
const algorithm = new HuntSzymanski();


shared( 'HuntSzymanski', algorithm, async t => {
  await t.test( 'handles long repeated matches minimally', () => {
    const o = [ ...Array( 32 ).fill( 'a' ), 'x', ...Array( 32 ).fill( 'b' ) ];
    const m = [ ...Array( 32 ).fill( 'b' ), 'y', ...Array( 32 ).fill( 'a' ) ];

    assertMinimal( o, m, diff( o, m, algorithm ) );
  } );

  await t.test( 'checks equality within colliding key buckets', () => {
    const o = [ { id: 'a' }, { id: 'b' } ], m = [ { id: 'b' }, { id: 'a' } ];
    const equals = ( a, b ) => a.id === b.id;
    const ops = algorithm.diff( { original: o, modified: m, equals, key: () => 'same' } );

    assertMinimal( o, m, ops, equals );
  } );
} );
