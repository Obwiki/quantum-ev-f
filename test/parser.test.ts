import { describe, expect, it } from 'vitest';
import { parseScenario } from '../src/dsl/parser.js';

const source = `
seed "abc"
clock 0..10 step 5
entity bot kind drone energy=10 zone="x"
rule low when energy < 20 every 5 emit charge priority 3
on charge set energy += 2 trace "ok"
`;

describe('parseScenario', () => {
  it('parses a qef scenario', () => {
    const scenario = parseScenario(source);
    expect(scenario.seed).toBe('abc');
    expect(scenario.entities[0]?.props.energy).toBe(10);
    expect(scenario.rules[0]?.condition.comparator).toBe('<');
    expect(scenario.handlers[0]?.mutation.operator).toBe('+=');
  });
});
