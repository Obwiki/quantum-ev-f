import type { Scenario, SimulationResult } from '../core/types.js';

export interface SimulationJob {
  id: string;
  scenario: Scenario;
  chaos?: {
    enabled: boolean;
    maxDelayTicks: number;
  };
}

export interface SimulationSnapshot {
  jobId: string;
  createdAt: string;
  checksum: string;
  result: SimulationResult;
}

export function checksumResult(result: SimulationResult): string {
  const raw = JSON.stringify(result);
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = Math.imul(31, hash) + raw.charCodeAt(i) | 0;
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function createSnapshot(jobId: string, result: SimulationResult): SimulationSnapshot {
  return {
    jobId,
    createdAt: new Date().toISOString(),
    checksum: checksumResult(result),
    result
  };
}
