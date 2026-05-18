import type { Entity, EntityProps, Mutation } from './types.js';

export class World {
  private entities = new Map<string, Entity>();

  constructor(initial: Entity[]) {
    for (const entity of initial) {
      this.entities.set(entity.id, structuredClone(entity));
    }
  }

  list(): Entity[] {
    return [...this.entities.values()].map((entity) => structuredClone(entity));
  }

  get(id: string): Entity | undefined {
    const entity = this.entities.get(id);
    return entity ? structuredClone(entity) : undefined;
  }

  mutate(entityId: string, mutation: Mutation): { before: EntityProps; after: EntityProps } {
    const entity = this.entities.get(entityId);
    if (!entity) throw new Error(`Cannot mutate missing entity: ${entityId}`);

    const before = structuredClone(entity.props);
    const current = entity.props[mutation.field];

    if (mutation.operator === '=') {
      entity.props[mutation.field] = mutation.value;
    } else {
      if (typeof current !== 'number' || typeof mutation.value !== 'number') {
        throw new Error(`Numeric mutation ${mutation.operator} requires numeric values`);
      }
      entity.props[mutation.field] = mutation.operator === '+=' ? current + mutation.value : current - mutation.value;
    }

    return { before, after: structuredClone(entity.props) };
  }
}
