const benchmarks = {
  algorithms: './algorithms.cjs'
};

const name = process.argv[ 2 ];

if ( name && ! benchmarks[ name ] ) throw new Error( `
  Unknown benchmark "${ name }".
  Available: ${ Object.keys( benchmarks ).join( ', ' ) }
` );

for ( const benchmark of name ? [ benchmarks[ name ] ] : Object.values( benchmarks ) )
  require( benchmark );
