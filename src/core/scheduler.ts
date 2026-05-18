import type { ForgeEvent } from './types.js';

export class Scheduler {
  private queue: ForgeEvent[] = [];

  push(event: ForgeEvent): void {
    this.queue.push(event);
    this.queue.sort((a, b) => a.tick - b.tick || b.priority - a.priority || a.id.localeCompare(b.id));
  }

  drain(tick: number): ForgeEvent[] {
    const ready = this.queue.filter((event) => event.tick === tick);
    this.queue = this.queue.filter((event) => event.tick !== tick);
    return ready;
  }

  all(): ForgeEvent[] {
    return [...this.queue];
  }
}
