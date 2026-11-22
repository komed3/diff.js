const { performance } = require( 'node:perf_hooks' );

const { Histogram } = require( '../.test-dist/algorithms/Histogram.js' );
const { HuntSzymanski } = require( '../.test-dist/algorithms/HuntSzymanski.js' );
const { LCS } = require( '../.test-dist/algorithms/LCS.js' );
const { Myers } = require( '../.test-dist/algorithms/Myers.js' );
const { Patience } = require( '../.test-dist/algorithms/Patience.js' );


const algorithms = [
  [ 'Myers', new Myers() ],
  [ 'LCS', new LCS() ],
  [ 'Hunt-Szymanski', new HuntSzymanski() ],
  [ 'Patience', new Patience() ],
  [ 'Histogram', new Histogram() ]
];

const equals = ( a, b ) => a === b;
const sizes = [ 256, 512, 1024 ];
const warmups = 2, samples = 7;
