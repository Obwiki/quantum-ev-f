#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { Command } from 'commander';
import { parseScenario } from '../dsl/parser.js';
import { ForgeEngine } from '../core/engine.js';
import { ConsoleTracePlugin } from '../plugins/runtime/trace-plugin.js';
import { createSnapshot } from '../workers/snapshot.js';
import { renderTable } from '../utils/table.js';

const program = new Command();

program
  .name('qef')
  .description('Quantum Event Forge scenario runner')
  .version('1.0.0');

program
  .command('run')
  .argument('<file>', 'Path to .qef scenario')
  .option('--chaos', 'Enable deterministic event delay chaos')
  .option('--json', 'Print full JSON result')
  .action(async (file: string, options: { chaos?: boolean; json?: boolean }) => {
    const source = await readFile(file, 'utf8');
    const scenario = parseScenario(source);
    const engineOptions = {
      ...(options.chaos ? { chaos: { enabled: true, maxDelayTicks: scenario.clock.step } } : {}),
      plugins: options.json ? [] : [new ConsoleTracePlugin()]
    };
    const engine = new ForgeEngine(scenario, engineOptions);
    const result = await engine.run();
    const snapshot = createSnapshot(`job-${Date.now()}`, result);

    if (options.json) {
      console.log(JSON.stringify(snapshot, null, 2));
      return;
    }

    console.log('\nFinal entities');
    console.log(renderTable(result.finalEntities.map((entity) => ({
      id: entity.id,
      kind: entity.kind,
      props: JSON.stringify(entity.props)
    }))));
    console.log(`\nTrace entries: ${result.trace.length}`);
    console.log(`Checksum: ${snapshot.checksum}`);
  });

program.parseAsync().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
