import { z } from 'zod';
import { tokenize, type Token } from './tokenizer.js';
import type { Comparator, Entity, Handler, MutationOperator, Primitive, Rule, Scenario } from '../core/types.js';

const scenarioSchema = z.object({
  seed: z.string().min(1),
  clock: z.object({ from: z.number(), to: z.number(), step: z.number().positive() }),
  entities: z.array(z.object({ id: z.string(), kind: z.string(), props: z.record(z.union([z.string(), z.number(), z.boolean()])) })),
  rules: z.array(z.object({
    id: z.string(),
    condition: z.object({
      field: z.string(),
      comparator: z.enum(['==', '!=', '<', '<=', '>', '>=']),
      value: z.union([z.string(), z.number(), z.boolean()])
    }),
    every: z.number().positive(),
    emit: z.string(),
    priority: z.number()
  })),
  handlers: z.array(z.object({
    event: z.string(),
    mutation: z.object({
      field: z.string(),
      operator: z.enum(['=', '+=', '-=']),
      value: z.union([z.string(), z.number(), z.boolean()])
    }),
    trace: z.string().optional()
  }))
});

export function parseScenario(input: string): Scenario {
  const parser = new Parser(tokenize(input));
  const scenario = parser.parse();
  return scenarioSchema.parse(scenario);
}

class Parser {
  private cursor = 0;

  constructor(private readonly tokens: Token[]) {}

  parse(): Scenario {
    const scenario: Scenario = {
      seed: 'default-seed',
      clock: { from: 0, to: 100, step: 1 },
      entities: [],
      rules: [],
      handlers: []
    };

    while (!this.match('eof')) {
      this.skipNewlines();
      if (this.match('eof')) break;
      const keyword = this.expect('word').value;

      switch (keyword) {
        case 'seed': scenario.seed = this.expect('string').value; break;
        case 'clock': scenario.clock = this.parseClock(); break;
        case 'entity': scenario.entities.push(this.parseEntity()); break;
        case 'rule': scenario.rules.push(this.parseRule()); break;
        case 'on': scenario.handlers.push(this.parseHandler()); break;
        default: throw this.error(`Unknown statement: ${keyword}`);
      }
      this.consumeLine();
    }

    return scenario;
  }

  private parseClock(): Scenario['clock'] {
    const from = Number(this.expect('number').value);
    this.expect('range');
    const to = Number(this.expect('number').value);
    this.expectWord('step');
    const step = Number(this.expect('number').value);
    return { from, to, step };
  }

  private parseEntity(): Entity {
    const id = this.expect('word').value;
    this.expectWord('kind');
    const kind = this.expect('word').value;
    const props: Record<string, Primitive> = {};

    while (!this.match('newline') && !this.match('eof')) {
      const key = this.expect('word').value;
      this.expectOperator('=');
      props[key] = this.parseValue();
    }

    return { id, kind, props };
  }

  private parseRule(): Rule {
    const id = this.expect('word').value;
    this.expectWord('when');
    const field = this.expect('word').value;
    const comparator = this.expect('operator').value as Comparator;
    const value = this.parseValue();
    this.expectWord('every');
    const every = Number(this.expect('number').value);
    this.expectWord('emit');
    const emit = this.expect('word').value;
    this.expectWord('priority');
    const priority = Number(this.expect('number').value);

    return { id, condition: { field, comparator, value }, every, emit, priority };
  }

  private parseHandler(): Handler {
    const event = this.expect('word').value;
    this.expectWord('set');
    const field = this.expect('word').value;
    const operator = this.expect('operator').value as MutationOperator;
    const value = this.parseValue();
    let trace: string | undefined;

    if (this.peek().type === 'word' && this.peek().value === 'trace') {
      this.expectWord('trace');
      trace = this.expect('string').value;
    }

    return trace === undefined
      ? { event, mutation: { field, operator, value } }
      : { event, mutation: { field, operator, value }, trace };
  }

  private parseValue(): Primitive {
    const token = this.peek();
    if (token.type === 'string') return this.advance().value;
    if (token.type === 'number') return Number(this.advance().value);
    if (token.type === 'word') {
      const value = this.advance().value;
      if (value === 'true') return true;
      if (value === 'false') return false;
      return value;
    }
    throw this.error(`Expected value, got ${token.type}`);
  }

  private expect(type: Token['type']): Token {
    const token = this.peek();
    if (token.type !== type) throw this.error(`Expected ${type}, got ${token.type}`);
    return this.advance();
  }

  private expectWord(value: string): void {
    const token = this.expect('word');
    if (token.value !== value) throw this.error(`Expected word "${value}", got "${token.value}"`);
  }

  private expectOperator(value: string): void {
    const token = this.expect('operator');
    if (token.value !== value) throw this.error(`Expected operator "${value}", got "${token.value}"`);
  }

  private consumeLine(): void {
    while (!this.match('newline') && !this.match('eof')) this.advance();
    this.skipNewlines();
  }

  private skipNewlines(): void {
    while (this.match('newline')) this.advance();
  }

  private match(type: Token['type']): boolean {
    return this.peek().type === type;
  }

  private peek(): Token {
    return this.tokens[this.cursor] ?? this.tokens[this.tokens.length - 1]!;
  }

  private advance(): Token {
    return this.tokens[this.cursor++]!;
  }

  private error(message: string): Error {
    const token = this.peek();
    return new Error(`${message} at ${token.line}:${token.column}`);
  }
}
