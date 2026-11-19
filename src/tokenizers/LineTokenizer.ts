import type { DiffToken } from '../types/token';
import type { DiffTokenizer } from '../types/tokenizer';


export class LineTokenizer implements DiffTokenizer {
  private readonly pattern = /\r\n|[\r\n\u2028\u2029]/gu;

  public tokenize ( text: string ) : DiffToken[] {
    const tokens: DiffToken[] = [];
    let start = 0, match: RegExpExecArray | null;
  }
}
