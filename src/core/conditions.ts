import type { Condition, Entity, Primitive } from './types.js';

export function matchesCondition(entity: Entity, condition: Condition): boolean {
  const actual = condition.field === 'kind' ? entity.kind : entity.props[condition.field];
  const expected = condition.value;

  switch (condition.comparator) {
    case '==': return actual === expected;
    case '!=': return actual !== expected;
    case '<': return asNumber(actual) < asNumber(expected);
    case '<=': return asNumber(actual) <= asNumber(expected);
    case '>': return asNumber(actual) > asNumber(expected);
    case '>=': return asNumber(actual) >= asNumber(expected);
  }
}

function asNumber(value: Primitive | undefined): number {
  if (typeof value !== 'number') throw new Error(`Expected number, got ${String(value)}`);
  return value;
}
