# Lattice Forge documentation

This documentation describes the product and the software that exist today. It is intentionally kept separate from the future build plan so reviewers can distinguish implemented behaviour from product direction.

## Reading order

1. [Business model](business-model.md) â€” the problem, users, value, assumptions, and responsible product boundaries.
2. [Technical architecture](technical-architecture.md) â€” the running system, contracts, calculations, validation, and test strategy.
3. [Implementation log](implementation-log.md) â€” the evidence and decisions recorded after each build phase.
4. [Build prompts](../prompts/BUILD_PROMPTS.md) â€” the phased implementation plan, including work not yet delivered.

## Current status

| Phase | Status | Outcome |
|---|---|---|
| 00 â€” Full-stack foundation | Implemented | .NET API, React/Vite client, API health check, and development proxy |
| 01 â€” Manufacturing analysis | Implemented | Deterministic material catalogue and illustrative analysis API |
| 02 ? Industrial workspace shell | Implemented | Responsive workspace frame, design controls, analysis panel, view toolbar, Zustand UI state, and accessible component tests |
| 03 ? Parametric Three.js viewport | Implemented | Procedural bracket geometry, orbit/reset camera, studio lighting, floor grid, WebGL fallback, and geometry normalization tests |
| 04 | Implemented | Typed live design controls, shared geometry state, presets, material/process compatibility, and live Three.js updates |
| 05 | Implemented | Bounded instanced lattice, Solid/Optimized/Compare modes, and draggable/keyboard comparison split |
| 06 | Implemented | Live API analysis, debounced cancellation, resilient states, comparison metrics, and illustrative disclosure |
| 07 | Implemented | Optimization scan, lattice reveal, deterministic risk heatmap, and reduced-motion flow |
| 08 | Implemented | SQLite persistence, saved designs, conceptual STL/JSON export, and explicit export limitations |
| 09 | Implemented | Responsive hardening, accessibility, reduced motion, WebGL lifecycle handling, and bounded rendering costs |
| 10 | Implemented | Interview-ready README, technical walkthrough, and one-command local development launcher |
| 11 | Planned | Fresh-context adversarial release review and targeted repair |

The current UI is an industrial workspace with a procedural Three.js bracket viewport. Geometry controls update the procedural bracket live, phase 05 adds a bounded conceptual lattice with Solid/Optimized/Compare views, phase 06 adds live API analysis, phase 07 adds the controlled optimization scan with deterministic risk heatmap, phase 08 adds local persistence and conceptual exports, and phase 09 hardens the responsive/accessibility/performance boundary. Phase 10 makes the repository ready to explain and run in an interview; phase 11 remains the final adversarial review.

## Documentation ownership

Documentation is part of every phase, not a final cleanup task. Whoever implements a phase must, in the same work unit:

- document only the behaviour that was actually delivered;
- update the technical architecture when contracts, components, calculations, or operational requirements change;
- update the business model when the product proposition, assumptions, risks, or workflow change, or explicitly record that there was no business-model change;
- append the implementation log with scope, decisions, and exact verification results; and
- keep planned capabilities clearly labelled and separate from implemented behaviour.

If code and documentation disagree, the code is the current source of truth and the documentation must be corrected before the phase is considered complete.
