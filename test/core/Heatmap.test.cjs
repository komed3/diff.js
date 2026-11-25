const assert = require( 'node:assert/strict' );
const { test } = require( 'node:test' );


const { Myers } = require( '../../.test-dist/algorithms/Myers.js' );
const { Engine } = require( '../../.test-dist/core/Engine.js' );
const { Heatmap } = require( '../../.test-dist/core/Heatmap.js' );
const { Character } = require( '../../.test-dist/tokenizers/Character.js' );


const algorithm = new Myers();
const engine = ( options ) => new Engine( { algorithm, ...options } );
const create = ( original, modified, options = {}, engineOptions = {} ) => {
  const result = engine( engineOptions ).process( { original, modified } );
  return new Heatmap( result ).create( options );
};


test( 'Heatmap', async t => {
  await t.test( 'creates a raster with the configured dimensions', () => {
    const heatmap = create( 'one', 'two', { x: 4, y: 3 } );

    assert.equal( heatmap.width, 4 );
    assert.equal( heatmap.height, 3 );
    assert.equal( heatmap.cells.length, 12 );
  } );

  await t.test( 'creates an empty raster for unchanged input', () => {
    const heatmap = create( 'one\ntwo', 'one\ntwo', { x: 2, y: 2 } );
    assert.ok( heatmap.cells.every( ( { activity, intensity } ) => activity === 0 && intensity === 0 ) );
  } );

  await t.test( 'clusters insertions by their position', () => {
    const heatmap = create( 'abc', 'abc\nxy', { x: 3, y: 2 } );
    const first = heatmap.cells.find( ( { x, y } ) => x === 0 && y === 1 );
    const second = heatmap.cells.find( ( { x, y } ) => x === 1 && y === 1 );

    assert.deepEqual( [ first.insert, first.delete, first.intensity ], [ 1, 0, 1 ] );
    assert.deepEqual( [ second.insert, second.delete, second.intensity ], [ 1, 0, 1 ] );
  } );

  await t.test( 'clusters deletions with negative intensity', () => {
    const heatmap = create( 'abc\nxy', 'abc', { x: 3, y: 2 } );
    const first = heatmap.cells.find( ( { x, y } ) => x === 0 && y === 1 );
    const second = heatmap.cells.find( ( { x, y } ) => x === 1 && y === 1 );

    assert.deepEqual( [ first.insert, first.delete, first.intensity ], [ 0, 1, -1 ] );
    assert.deepEqual( [ second.insert, second.delete, second.intensity ], [ 0, 1, -1 ] );
  } );

  await t.test( 'aggregates multiple changes in one cell', () => {
    const heatmap = create( 'a\nb\nc', 'x\ny\nz', { x: 1, y: 1 } );
    const [ { activity, change, intensity } ] = heatmap.cells;

    assert.equal( activity, 3 );
    assert.equal( change, 3 );
    assert.equal( intensity, 0 );
  } );

  await t.test( 'keeps changes neutral without token information', () => {
    const heatmap = create( 'old', 'new', { x: 3, y: 1 } );

    assert.deepEqual(
      heatmap.cells.map( ( { activity, change, intensity } ) => [ activity, change, intensity ] ),
      [ [ 1, 1, 0 ], [ 1, 1, 0 ], [ 1, 1, 0 ] ]
    );
  } );

  await t.test( 'maps token edits to their character positions', () => {
    const heatmap = create( 'abc', 'axc', { x: 3, y: 1 }, { tokenizer: new Character() } );
    const [ cell ] = heatmap.cells.filter( ( { activity } ) => activity > 0 );

    assert.deepEqual( [ cell.x, cell.y ], [ 1, 0 ] );
    assert.deepEqual( [ cell.insert, cell.delete, cell.activity, cell.intensity ], [ 1, 1, 2, 0 ] );
  } );

  await t.test( 'filters token insertions and deletions', () => {
    const options = { x: 3, y: 1 };
    const engineOptions = { tokenizer: new Character() };
    const inserted = create( 'abc', 'axc', { ...options, filter: 'insert' }, engineOptions );
    const deleted = create( 'abc', 'axc', { ...options, filter: 'delete' }, engineOptions );
    const changed = create( 'abc', 'axc', { ...options, filter: 'change' }, engineOptions );

    assert.deepEqual( inserted.cells.map( ( { activity } ) => activity ), [ 0, 1, 0 ] );
    assert.deepEqual( deleted.cells.map( ( { activity } ) => activity ), [ 0, 1, 0 ] );
    assert.deepEqual( changed.cells.map( ( { activity } ) => activity ), [ 0, 2, 0 ] );

    assert.equal( inserted.cells[ 1 ].intensity, 1 );
    assert.equal( deleted.cells[ 1 ].intensity, -1 );
    assert.equal( changed.cells[ 1 ].intensity, 0 );
  } );

  await t.test( 'filters line insertions and deletions', () => {
    const options = { x: 2, y: 2 };
    const inserted = create( 'a', 'a\nxy', options );
    const insertOnly = create( 'a', 'a\nxy', { ...options, filter: 'insert' } );
    const deleteOnly = create( 'a', 'a\nxy', { ...options, filter: 'delete' } );
    const deleted = create( 'a\nxy', 'a', options );
    const deleteFilter = create( 'a\nxy', 'a', { ...options, filter: 'delete' } );
    const insertFilter = create( 'a\nxy', 'a', { ...options, filter: 'insert' } );

    assert.equal( inserted.cells.reduce( ( sum, { activity } ) => sum + activity, 0 ), 2 );
    assert.equal( insertOnly.cells.reduce( ( sum, { activity } ) => sum + activity, 0 ), 2 );
    assert.equal( deleteOnly.cells.reduce( ( sum, { activity } ) => sum + activity, 0 ), 0 );

    assert.equal( deleted.cells.reduce( ( sum, { activity } ) => sum + activity, 0 ), 2 );
    assert.equal( deleteFilter.cells.reduce( ( sum, { activity } ) => sum + activity, 0 ), 2 );
    assert.equal( insertFilter.cells.reduce( ( sum, { activity } ) => sum + activity, 0 ), 0 );
  } );
} );
