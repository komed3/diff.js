export const assertOption = ( valid: boolean, name: string ) : void => {
  if ( ! valid ) throw new Error( `Invalid ${ name }` );
};
