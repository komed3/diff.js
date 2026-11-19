import type { DiffToken } from '../types/token';
import type { DiffTokenizer } from '../types/tokenizer';


export class LineTokenizer implements DiffTokenizer {
  public tokenize ( text: string ) : DiffToken[] {}
}
