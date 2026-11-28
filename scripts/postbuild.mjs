// scripts/postbuild.mjs

import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';


await mkdir( 'dist/cjs', { recursive: true } );
await writeFile( 'dist/cjs/package.json', JSON.stringify( { type: 'commonjs' }, null, 2 ) );

await mkdir( 'dist/esm', { recursive: true } );
await writeFile( 'dist/esm/package.json', JSON.stringify( { type: 'module' }, null, 2 ) );


const { name, version } = JSON.parse( await readFile( 'package.json', 'utf8' ) );
const copyright = ( await readFile( 'LICENSE', 'utf8' ) ).match( /^Copyright[^\r\n]*/m )?.[ 0 ];
const commit = execFileSync( 'git', [ 'rev-parse', '--short', 'HEAD' ], { encoding: 'utf8' } ).trim();
const preamble = `/*!\n * ${ name } v${ version }\n * ${ copyright }\n * Build: ${ commit }\n */\n`;

const bundle = await readFile( 'dist/bundle.js', 'utf8' );
await writeFile( 'dist/bundle.js', preamble + bundle.replace( /`(\\r)?(\r\n|\r|\n)`/g,
  ( _, cr, lb ) => JSON.stringify( ( cr ? '\r' : '' ) + lb )
) );
