import { Hunk } from '../../core/Hunk';
import type { LineScript, Result } from '../../types/engine';
import type { HunkOptions } from '../../types/hunk';
import type { TokenMeta } from '../../types/tokenizer';


export const getLines = < T extends TokenMeta > ( result: Result< T >, { context = 3 }: HunkOptions ) : LineScript< T >[] => {
  if ( context === 'all' ) return result.script;
  return new Hunk( { context } ).create( result ).flatMap( ( { lines } ) => lines ) as LineScript< T >[];
};
