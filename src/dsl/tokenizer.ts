export type TokenType = 'word' | 'number' | 'string' | 'operator' | 'range' | 'newline' | 'eof';

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

const operators = ['+=', '-=', '==', '!=', '<=', '>=', '=', '<', '>'];

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let line = 1;
  let column = 1;

  const push = (type: TokenType, value: string, startColumn = column) => {
    tokens.push({ type, value, line, column: startColumn });
  };

  while (i < input.length) {
    const char = input[i]!;

    if (char === '#') {
      while (i < input.length && input[i] !== '\n') advance();
      continue;
    }

    if (char === '\n') {
      push('newline', '\n');
      advanceLine();
      continue;
    }

    if (/\s/.test(char)) {
      advance();
      continue;
    }

    if (char === '"') {
      const start = column;
      advance();
      let value = '';
      while (i < input.length && input[i] !== '"') {
        value += input[i]!;
        advance();
      }
      if (input[i] !== '"') throw new Error(`Unterminated string at ${line}:${start}`);
      advance();
      push('string', value, start);
      continue;
    }

    if (char === '.' && input[i + 1] === '.') {
      const start = column;
      advance(); advance();
      push('range', '..', start);
      continue;
    }

    const op = operators.find((candidate) => input.startsWith(candidate, i));
    if (op) {
      const start = column;
      for (let j = 0; j < op.length; j++) advance();
      push('operator', op, start);
      continue;
    }

    if (/[-0-9]/.test(char)) {
      const start = column;
      let value = '';
      while (i < input.length && /[-0-9]/.test(input[i]!)) {
        value += input[i]!;
        advance();
      }
      push('number', value, start);
      continue;
    }

    if (/[A-Za-z0-9_-]/.test(char)) {
      const start = column;
      let value = '';
      while (i < input.length && /[A-Za-z0-9_-]/.test(input[i]!)) {
        value += input[i];
        advance();
      }
      push('word', value, start);
      continue;
    }

    throw new Error(`Unexpected character ${char} at ${line}:${column}`);
  }

  tokens.push({ type: 'eof', value: '', line, column });
  return tokens;

  function advance(): void {
    i += 1;
    column += 1;
  }

  function advanceLine(): void {
    i += 1;
    line += 1;
    column = 1;
  }
}
