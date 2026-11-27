const { performance } = require( 'node:perf_hooks' );

const { Histogram } = require( '../dist/algorithms/Histogram.js' );
const { HuntSzymanski } = require( '../dist/algorithms/HuntSzymanski.js' );
const { LCS } = require( '../dist/algorithms/LCS.js' );
const { Myers } = require( '../dist/algorithms/Myers.js' );
const { Patience } = require( '../dist/algorithms/Patience.js' );


const algorithms = [
  [ 'Myers', new Myers() ],
  [ 'LCS', new LCS() ],
  [ 'Hunt-Szymanski', new HuntSzymanski() ],
  [ 'Patience', new Patience() ],
  [ 'Histogram', new Histogram() ]
];

const equals = ( a, b ) => a === b, key = ( v ) => v;
const sizes = [ 256, 512, 1024 ], warmups = 2, samples = 7;


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


const results = [];

for ( const size of sizes ) for ( const [ name, original, modified ] of createCases( size ) ) {
  const input = { original, modified, equals, key };

  for ( const [ algorithm, instance ] of algorithms ) {
    for ( let i = 0; i < warmups; i++ ) instance.diff( input );

    const times = [];
    let operations;

    for ( let i = 0; i < samples; i++ ) {
      const start = performance.now();
      operations = instance.diff( input );
      times.push( performance.now() - start );
    }

    times.sort( ( a, b ) => a - b );

    const metrics = operations.reduce( ( result, operation ) => {
      if ( operation.type === 'equal' ) result.equal += operation.original.length;
      else if ( operation.type === 'insert' ) result.inserted += operation.modified.length;
      else result.deleted += operation.original.length;

      return result;
    }, { equal: 0, inserted: 0, deleted: 0 } );

    results.push( {
      algorithm, case: name, size, 'median ms': Number( times[ samples >> 1 ].toFixed( 3 ) ),
      operations: operations.length, equal: metrics.equal, inserted: metrics.inserted,
      deleted: metrics.deleted, edits: metrics.inserted + metrics.deleted
    } );
  }
}

console.table( results );
