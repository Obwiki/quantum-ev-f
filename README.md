# Quantum Event Forge

A deliberately unusual TypeScript project: a deterministic event-simulation engine with a tiny DSL, temporal graph scheduler, replayable pseudo-randomness, plugin hooks, worker-friendly snapshots, and trace export.

The project is intentionally over-engineered enough to be useful for practice: parsing, domain modeling, scheduling, event sourcing, deterministic randomness, plugin architecture, CLI, validation, and tests.

## What it does

You write a `.qef` scenario:

```qef
seed "orbit-cactus-42"
clock 0..120 step 5
entity drone-1 kind drone energy=87 zone="alpha"
rule low-energy when energy < 50 every 10 emit recharge priority 4
on recharge set energy += 25 trace "battery patched"
```

Then the engine simulates ticks, evaluates rules, emits events, applies mutations, and produces a deterministic trace.

## Commands

```bash
npm install
npm run dev
npm test
npm run build
npm start
```

## Architecture

- `src/dsl` — lexer/parser for the `.qef` language.
- `src/core` — simulation engine, scheduler, world model, event bus.
- `src/plugins` — runtime/storage plugins.
- `src/workers` — snapshot protocol for parallel/off-thread execution.
- `src/cli` — CLI runner.

## Ideas for extending it

- Add boolean expressions with `and/or`.
- Add graph edges between entities.
- Add a WASM plugin boundary.
- Add a browser visualizer.
- Persist traces to SQLite.
- Add property-based tests for deterministic replay.
