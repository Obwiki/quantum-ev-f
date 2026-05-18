import type { ForgeEvent, TraceEntry } from '../../core/types.js';
import type { World } from '../../core/world.js';

export interface RuntimePlugin {
  name: string;
  beforeTick?(tick: number, world: World): void | Promise<void>;
  afterEvent?(event: ForgeEvent, trace?: TraceEntry): void | Promise<void>;
  afterSimulation?(): void | Promise<void>;
}
