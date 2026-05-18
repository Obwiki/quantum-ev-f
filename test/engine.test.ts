import { describe, expect, it } from 'vitest';
import { ForgeEngine } from '../src/core/engine.js';
import { parseScenario } from '../src/dsl/parser.js';

const source = `
seed "abc"
clock 0..10 step 5
entity bot kind drone energy=10 zone="x"
rule low when energy < 20 every 5 emit charge priority 3
on charge set energy += 2 trace "ok"
`;

describe('ForgeEngine', () => {
  it('runs deterministic simulation', async () => {
    const scenario = parseScenario(source);
    const first = await new ForgeEngine(scenario).run();
    const second = await new ForgeEngine(scenario).run();

    expect(first).toEqual(second);
    expect(first.finalEntities[0]?.props.energy).toBe(16);
    expect(first.trace).toHaveLength(3);
  });
});
