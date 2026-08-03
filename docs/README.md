# Lattice Forge documentation

This documentation describes the product and the software that exist today. It is intentionally kept separate from the future build plan so reviewers can distinguish implemented behaviour from product direction.

## Reading order

1. [Business model](business-model.md) — the problem, users, value, assumptions, and responsible product boundaries.
2. [Technical architecture](technical-architecture.md) — the running system, contracts, calculations, validation, and test strategy.
3. [Implementation log](implementation-log.md) — the evidence and decisions recorded after each build phase.
4. [Build prompts](../BUILD_PROMPTS.md) — the phased implementation plan, including work not yet delivered.

## Current status

| Phase | Status | Outcome |
|---|---|---|
| 00 — Full-stack foundation | Implemented | .NET API, React/Vite client, API health check, and development proxy |
| 01 — Manufacturing analysis | Implemented | Deterministic material catalogue and illustrative analysis API |
| 02 ? Industrial workspace shell | Implemented | Responsive workspace frame, design controls, analysis panel, view toolbar, Zustand UI state, and accessible component tests |
| 03 ? Parametric Three.js viewport | Implemented | Procedural bracket geometry, orbit/reset camera, studio lighting, floor grid, WebGL fallback, and geometry normalization tests |
| 04?11 | Planned | Live controls, lattice/heatmap reveal, API integration, persistence, hardening, and release review |

The current UI is an industrial workspace with a procedural Three.js bracket viewport. Geometry controls remain presentational in phase 03; lattice and heatmap reveal, live analysis integration, persistence, and export remain planned.

## Documentation ownership

Documentation is part of every phase, not a final cleanup task. Whoever implements a phase must, in the same work unit:

- document only the behaviour that was actually delivered;
- update the technical architecture when contracts, components, calculations, or operational requirements change;
- update the business model when the product proposition, assumptions, risks, or workflow change, or explicitly record that there was no business-model change;
- append the implementation log with scope, decisions, and exact verification results; and
- keep planned capabilities clearly labelled and separate from implemented behaviour.

If code and documentation disagree, the code is the current source of truth and the documentation must be corrected before the phase is considered complete.
