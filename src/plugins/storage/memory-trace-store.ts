import type { SimulationResult, TraceEntry } from '../../core/types.js';

export class MemoryTraceStore {
  private entries: TraceEntry[] = [];

  append(entry: TraceEntry): void {
    this.entries.push(structuredClone(entry));
  }

  toResult(seed: string, finalEntities: SimulationResult['finalEntities'], emitted: SimulationResult['emitted']): SimulationResult {
    return {
      seed,
      trace: structuredClone(this.entries),
      finalEntities: structuredClone(finalEntities),
      emitted: structuredClone(emitted)
    };
  }
}
