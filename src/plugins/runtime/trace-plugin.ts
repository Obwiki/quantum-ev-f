import type { ForgeEvent, TraceEntry } from '../../core/types.js';
import type { RuntimePlugin } from './plugin.js';

export class ConsoleTracePlugin implements RuntimePlugin {
  name = 'console-trace';

  afterEvent(event: ForgeEvent, trace?: TraceEntry): void {
    if (!trace) return;
    console.log(`[${event.tick}] ${event.entityId} <- ${event.type}: ${trace.message}`);
  }
}
