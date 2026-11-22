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


const createCases = ( size ) => {
  const original = Array.from( { length: size }, ( _, i ) => `line-${ i }` ), sparse = original.slice();
  sparse[ size >> 1 ] = 'changed';

  const block = original.slice();
  for ( let i = ( size >> 1 ) - 4; i < ( size >> 1 ) + 4; i++ ) block[ i ] = `changed-${ i }`;

  const repeated = Array.from( { length: size }, ( _, i ) => i % 8 ), modifiedRepeated = repeated.slice();
  for ( let i = 16; i < size; i += 64 ) modifiedRepeated[ i ] = -i;

  return [
    [ 'identical', original, original.slice() ],
    [ 'sparse changes', original, sparse ],
    [ 'single insertion', original, [ ...original.slice( 0, size >> 1 ), 'inserted', ...original.slice( size >> 1 ) ] ],
    [ 'single deletion', original, [ ...original.slice( 0, size >> 1 ), ...original.slice( ( size >> 1 ) + 1 ) ] ],
    [ 'leading insertion', original, [ 'inserted', ...original ] ],
    [ 'trailing insertion', original, [ ...original, 'inserted' ] ],
    [ 'leading deletion', original, original.slice( 1 ) ],
    [ 'trailing deletion', original, original.slice( 0, -1 ) ],
    [ 'block replacement', original, block ],
    [ 'repeated values', repeated, modifiedRepeated ],
    [ 'unrelated', original, original.map( ( _, i ) => `other-${ i }` ) ]
  ];
};
