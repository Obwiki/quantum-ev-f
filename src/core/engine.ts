import { matchesCondition } from './conditions.js';
import { XorShift32 } from './random.js';
import { Scheduler } from './scheduler.js';
import { World } from './world.js';
import type { ForgeEvent, Handler, Scenario, SimulationResult, TraceEntry } from './types.js';
import type { RuntimePlugin } from '../plugins/runtime/plugin.js';

export interface EngineOptions {
  plugins?: RuntimePlugin[];
  chaos?: {
    enabled: boolean;
    maxDelayTicks: number;
  };
}

export class ForgeEngine {
  private readonly rng: XorShift32;
  private readonly world: World;
  private readonly scheduler = new Scheduler();
  private readonly emitted: ForgeEvent[] = [];
  private readonly trace: TraceEntry[] = [];

  constructor(
    private readonly scenario: Scenario,
    private readonly options: EngineOptions = {}
  ) {
    this.rng = new XorShift32(scenario.seed);
    this.world = new World(scenario.entities);
  }

  async run(): Promise<SimulationResult> {
    const { from, to, step } = this.scenario.clock;

    for (let tick = from; tick <= to; tick += step) {
      await this.callBeforeTick(tick);
      this.evaluateRules(tick);
      const events = this.scheduler.drain(tick);

      for (const event of events) {
        const trace = this.applyEvent(event);
        await this.callAfterEvent(event, trace);
      }
    }

    for (const plugin of this.options.plugins ?? []) {
      await plugin.afterSimulation?.();
    }

    return {
      seed: this.scenario.seed,
      trace: structuredClone(this.trace),
      finalEntities: this.world.list(),
      emitted: structuredClone(this.emitted)
    };
  }

  private evaluateRules(tick: number): void {
    for (const entity of this.world.list()) {
      for (const rule of this.scenario.rules) {
        if (tick % rule.every !== 0) continue;
        if (!matchesCondition(entity, rule.condition)) continue;

        const delay = this.options.chaos?.enabled
          ? Math.floor(this.rng.next() * (this.options.chaos.maxDelayTicks + 1))
          : 0;

        const event: ForgeEvent = {
          id: this.rng.id('evt'),
          type: rule.emit,
          tick: tick + delay,
          entityId: entity.id,
          priority: rule.priority,
          payload: { rule: rule.id, originalTick: tick }
        };

        this.scheduler.push(event);
        this.emitted.push(event);
      }
    }
  }

  private applyEvent(event: ForgeEvent): TraceEntry | undefined {
    const handler = this.findHandler(event.type);
    if (!handler) return undefined;

    const { before, after } = this.world.mutate(event.entityId, handler.mutation);
    const trace: TraceEntry = {
      tick: event.tick,
      entityId: event.entityId,
      event: event.type,
      message: handler.trace ?? `applied ${event.type}`,
      before,
      after
    };

    this.trace.push(trace);
    return trace;
  }

  private findHandler(eventType: string): Handler | undefined {
    return this.scenario.handlers.find((handler) => handler.event === eventType);
  }

  private async callBeforeTick(tick: number): Promise<void> {
    for (const plugin of this.options.plugins ?? []) {
      await plugin.beforeTick?.(tick, this.world);
    }
  }

  private async callAfterEvent(event: ForgeEvent, trace?: TraceEntry): Promise<void> {
    for (const plugin of this.options.plugins ?? []) {
      await plugin.afterEvent?.(event, trace);
    }
  }
}
