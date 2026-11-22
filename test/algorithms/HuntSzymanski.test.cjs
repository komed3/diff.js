const shared = require( './shared.cjs' );


const { HuntSzymanski } = require( '../../.test-dist/algorithms/HuntSzymanski.js' );
const algorithm = new HuntSzymanski();


shared( 'HuntSzymanski', algorithm );
