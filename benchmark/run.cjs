const benchmarks = {
  algorithms: './algorithms.cjs'
};

const name = process.argv[ 2 ], benchmark = benchmarks[ name ];
if ( ! benchmark ) throw new Error( `
  Unknown benchmark "${ name ?? '' }".
  Available: ${ Object.keys( benchmarks ).join( ', ' ) }
` );

require( benchmark );
