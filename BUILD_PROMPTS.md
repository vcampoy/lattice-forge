# Build Lattice Forge with GPT-5.6 Luna High

This document is a sequential execution plan for building a polished Three.js and ASP.NET Core demo for a Senior Full Stack Engineer interview at Materialise.

## How to use this plan

1. Use one Codex task and select **GPT-5.6 Luna / High**.
2. Send the prompts in order. Do not combine them into one large prompt.
3. After each phase, require its verification commands to pass before sending the next prompt.
4. If a phase fails, ask the model to fix only that phase and repeat its verification. Do not move forward with known failures.
5. Run the final review prompt in a fresh Codex task so it reviews the result without implementation bias.

GPT-5.6 Luna works best here when each request is narrow, explicit, and independently verifiable. The prompts below deliberately build the application as reviewable work units.

## Product contract

**Product name:** Lattice Forge

**Pitch:** An interactive Design for Additive Manufacturing workspace that transforms a solid mechanical bracket into a lightweight lattice design and explains its manufacturability.

**Core journey:**

1. Inspect a high-quality parametric bracket in 3D.
2. Adjust dimensions, wall thickness, lattice density, material, and manufacturing process.
3. Request a server-side manufacturing analysis.
4. Trigger an optimization scan that reveals the lattice and overhang-risk heatmap.
5. Compare original and optimized metrics.
6. Save the design or export an STL.

**Important honesty constraint:** All cost, time, weight, and printability results must be labelled as illustrative estimates. The demo must never claim engineering-grade validation or affiliation with Materialise.

## Technical contract

| Area | Decision |
|---|---|
| Frontend | React, TypeScript, Vite |
| 3D | Three.js through React Three Fiber, with direct Three.js geometry/material APIs where appropriate |
| State | Zustand for shared design and presentation state |
| API | ASP.NET Core targeting .NET 10 |
| Persistence | EF Core with SQLite |
| Backend tests | xUnit |
| Frontend tests | Vitest and React Testing Library |
| Styling | Plain CSS with design tokens; no heavyweight component framework |
| Runtime assets | Procedural geometry and lighting; no required remote images or HDR files |

Target structure:

```text
src/
  LatticeForge.Api/
  LatticeForge.Web/
tests/
  LatticeForge.Api.Tests/
BUILD_PROMPTS.md
README.md
LatticeForge.sln
```

## Global execution rules

Every implementation prompt below assumes these rules:

- Read `AGENTS.md` and `BUILD_PROMPTS.md` before editing.
- Inspect the current repository state and preserve completed work.
- Implement only the requested phase.
- Prefer the smallest maintainable design; do not introduce speculative abstractions.
- Keep UI copy, code, identifiers, comments, and documentation in English.
- Do not use Materialise logos, trademarks, screenshots, or proprietary UI assets.
- Do not hide errors or replace real failures with mocked success.
- Run the requested verification commands and report their exact results.
- End with: changed files, key decisions, verification results, and any remaining risk.
- Do not add AI attribution or `Co-Authored-By` metadata.

## Living documentation contract

Documentation is part of the definition of done for every executable phase. Each phase must update the English documentation in `docs/` in the same work unit as the behaviour it describes:

1. Update `docs/technical-architecture.md` with the components, contracts, data flow, calculations, constraints, and operational details that actually changed.
2. Update `docs/business-model.md` with product, workflow, value, assumption, or risk implications. If the phase has no business-model impact, explicitly record that fact in the phase log instead of inventing one.
3. Append `docs/implementation-log.md` with delivered scope, decisions and tradeoffs, and the exact commands and results used to verify the phase.
4. Keep implemented behaviour and planned capabilities in clearly labelled, separate sections. Never describe a planned feature as available.
5. Include the documentation files changed in the phase's final response.

Documentation must remain concise, reviewer-friendly, and technically honest. Code and executable tests are the source of truth when documenting current behaviour.

## User-provided rules — mandatory in every prompt

The following block is repeated inside every executable prompt so the model cannot lose it between phases:

```text
Mandatory user rules for this phase:
- Communication: speak in concise caveman style in progress and final messages. Never put caveman style into code, identifiers, UI copy, comments, tests, or documentation.
- Apply SOLID wherever production logic is introduced. Prefer clear boundaries and the smallest useful abstractions.
- Use strict TDD Red-Green-Refactor: write the smallest tests first, run them and confirm they fail for the intended reason, implement the smallest behaviour, run the tests until green, then refactor and rerun the full relevant suite. Never write tests only after the implementation.
- For .NET code, apply Engram topic coding-style-dotnet: prefer TryGetValue/TryGet, primary constructors for DI where appropriate, collection expressions [], braces for single-line if/foreach, List<T>.Exists/TrueForAll on materialized lists, concrete types when an abstraction is unnecessary, static readonly arrays for repeated/hot literal arrays, and LINQ projections/filters where S3267 applies.
- For tests, apply Engram topic unit-test-rules: use method names like MethodName_should_do_action_when_condition, make private helpers static when possible, remove unused usings, prefer private static readonly arrays over repeated inline arrays, and use the project's normal non-incremental build plus test workflow.
- For frontend code, follow current React/TypeScript/Three.js best practices: strict types, stable references, cleanup of subscriptions and GPU resources, accessible controls, maintainable component boundaries, and no avoidable per-frame allocations.
```

---

## Prompt 00 — Scaffold a runnable full-stack repository

```text
Mandatory user rules for this phase:
- Communication: speak in concise caveman style in progress and final messages. Never put caveman style into code, identifiers, UI copy, comments, tests, or documentation.
- Apply SOLID. Use strict TDD Red-Green-Refactor: tests first, prove red, implement, prove green, then refactor.
- For .NET and tests, apply Engram topics coding-style-dotnet and unit-test-rules, including static readonly arrays for repeated/hot literal arrays and names like MethodName_should_do_action_when_condition.
- For frontend code, use strict TypeScript, accessible UI, stable references, cleanup, and no avoidable per-frame allocations.
- Documentation: update docs/technical-architecture.md with actual changes, update docs/business-model.md with product implications or explicitly log no change, append exact scope and verification to docs/implementation-log.md, keep planned work separate from implemented behaviour, and report documentation files changed.

Implement phase 00 of Lattice Forge: create the smallest runnable full-stack foundation.

Before editing, read AGENTS.md and BUILD_PROMPTS.md and inspect the repository and installed tool versions. The directory may be empty and may not yet be a Git repository.

Scope:
- Initialize Git if needed and add an appropriate .gitignore and .editorconfig.
- Create LatticeForge.sln.
- Create src/LatticeForge.Api as an ASP.NET Core .NET 10 API.
- Create src/LatticeForge.Web as a Vite React TypeScript application.
- Create tests/LatticeForge.Api.Tests with xUnit and reference the API project.
- Add a GET /api/health endpoint returning a small typed JSON response.
- Configure Vite to proxy /api to the local API in development.
- Replace template demo content with a minimal full-screen shell that displays “Lattice Forge” and the API health state.
- Add root README instructions for installing, running, building, and testing both applications.
- Keep development ports explicit and consistent in API launch settings, Vite config, and README.

Do not add Three.js, database persistence, or manufacturing logic yet.

Acceptance criteria:
- dotnet build LatticeForge.sln succeeds.
- dotnet test LatticeForge.sln succeeds.
- npm install succeeds in src/LatticeForge.Web.
- npm run build succeeds in src/LatticeForge.Web.
- The frontend can call /api/health through the Vite proxy without enabling broad production CORS.

Run every verification command. Fix failures before finishing. Suggest, but do not create, the conventional commit: chore: scaffold lattice forge full-stack workspace
```

## Prompt 01 — Build the manufacturing-analysis domain and API

```text
Mandatory user rules for this phase:
- Communication: speak in concise caveman style in progress and final messages. Never put caveman style into code, identifiers, UI copy, comments, tests, or documentation.
- Apply SOLID. Use strict TDD Red-Green-Refactor: tests first, prove red, implement, prove green, then refactor.
- For .NET and tests, apply Engram topics coding-style-dotnet and unit-test-rules, including static readonly arrays for repeated/hot literal arrays and names like MethodName_should_do_action_when_condition.
- For frontend code, use strict TypeScript, accessible UI, stable references, cleanup, and no avoidable per-frame allocations.
- Documentation: update docs/technical-architecture.md with actual changes, update docs/business-model.md with product implications or explicitly log no change, append exact scope and verification to docs/implementation-log.md, keep planned work separate from implemented behaviour, and report documentation files changed.

Implement phase 01 of Lattice Forge: a tested, server-side manufacturing analysis vertical slice.

Read AGENTS.md and BUILD_PROMPTS.md first. Preserve phase 00. Work only in the API and backend test projects except for generated API documentation if needed.

Create a compact domain model for:
- BracketParameters: length, height, depth, wallThickness, holeRadius, latticeDensity.
- ManufacturingProcess: SLS, SLA, MetalLPBF.
- MaterialProfile: id, name, process, density, costPerKg, minimumWallThickness, depositionRate.
- ManufacturingAnalysis: solidVolume, optimizedVolume, estimatedWeight, estimatedCost, estimatedPrintMinutes, materialReductionPercent, printabilityScore, supportRisk, warnings, and an explicit illustrativeEstimate flag.

Implement:
- GET /api/materials returning a small deterministic catalogue with at least one material per process.
- POST /api/analyses accepting bracket parameters, material id, and process.
- A deterministic analysis service with documented simplified equations. Keep units explicit: millimetres, cubic centimetres, grams, euros, and minutes.
- Validation with useful Problem Details responses for impossible dimensions, incompatible process/material selections, and thickness outside safe bounds.
- OpenAPI metadata for request/response contracts.

The equations must be internally coherent and monotonic where expected: increasing lattice density must not reduce optimized volume; increasing thickness must not reduce weight. Results are illustrative, not engineering-grade.

Add xUnit tests for:
- valid analysis,
- invalid dimensions,
- incompatible material/process,
- minimum wall warning,
- monotonic density and thickness behaviour,
- score clamping between 0 and 100.

Do not add EF Core or persistence yet.

Acceptance criteria:
- dotnet build LatticeForge.sln succeeds.
- dotnet test LatticeForge.sln succeeds.
- The API response uses stable camelCase JSON.
- No controller or endpoint contains the analysis equations directly.

Run verification and fix failures. Suggest, but do not create, the conventional commit: feat(api): add illustrative manufacturing analysis
```

## Prompt 02 — Create the visual application shell

```text
Mandatory user rules for this phase:
- Communication: speak in concise caveman style in progress and final messages. Never put caveman style into code, identifiers, UI copy, comments, tests, or documentation.
- Apply SOLID. Use strict TDD Red-Green-Refactor: tests first, prove red, implement, prove green, then refactor.
- For .NET and tests, apply Engram topics coding-style-dotnet and unit-test-rules, including static readonly arrays for repeated/hot literal arrays and names like MethodName_should_do_action_when_condition.
- For frontend code, use strict TypeScript, accessible UI, stable references, cleanup, and no avoidable per-frame allocations.
- Documentation: update docs/technical-architecture.md with actual changes, update docs/business-model.md with product implications or explicitly log no change, append exact scope and verification to docs/implementation-log.md, keep planned work separate from implemented behaviour, and report documentation files changed.

Implement phase 02 of Lattice Forge: the polished application shell and design system, without the 3D scene.

Read AGENTS.md and BUILD_PROMPTS.md first. Preserve backend behaviour.

Frontend scope:
- Install only the dependencies needed for React UI state and icons. Use Zustand and Lucide React.
- Create a coherent CSS token system for colour, typography, spacing, radii, borders, shadows, and motion.
- Build a full-viewport industrial workspace with:
  - top product header and connection status,
  - left Design Controls panel,
  - central Viewport placeholder,
  - right Manufacturing Analysis panel,
  - compact bottom view controls.
- Use a graphite/titanium base palette, restrained cyan for interaction, and amber/red only for manufacturing warnings.
- Add a subtle technical grid and atmospheric radial lighting using CSS only.
- Make the panels feel lightweight and precise, not like a generic admin dashboard.
- Add responsive behaviour down to 768px without breaking the viewport.
- Use semantic elements, visible keyboard focus, labelled controls, and sufficient contrast.

Use realistic placeholder labels but do not implement form behaviour or fabricated analysis numbers yet. Empty metric states should use an em dash or “Awaiting analysis”.

Acceptance criteria:
- npm run build succeeds.
- Add and run frontend component tests for the main regions and accessible names.
- There is no horizontal page scroll at desktop width.
- No external runtime image, font, or stylesheet is required.

Run verification and fix failures. Suggest, but do not create, the conventional commit: feat(web): add industrial design workspace shell
```

## Prompt 03 — Render the parametric bracket with Three.js

```text
Mandatory user rules for this phase:
- Communication: speak in concise caveman style in progress and final messages. Never put caveman style into code, identifiers, UI copy, comments, tests, or documentation.
- Apply SOLID. Use strict TDD Red-Green-Refactor: tests first, prove red, implement, prove green, then refactor.
- For .NET and tests, apply Engram topics coding-style-dotnet and unit-test-rules, including static readonly arrays for repeated/hot literal arrays and names like MethodName_should_do_action_when_condition.
- For frontend code, use strict TypeScript, accessible UI, stable references, cleanup, and no avoidable per-frame allocations.
- Documentation: update docs/technical-architecture.md with actual changes, update docs/business-model.md with product implications or explicitly log no change, append exact scope and verification to docs/implementation-log.md, keep planned work separate from implemented behaviour, and report documentation files changed.

Implement phase 03 of Lattice Forge: a production-quality Three.js viewport containing a parametric mechanical bracket.

Read AGENTS.md and BUILD_PROMPTS.md first. Preserve the existing shell.

Install Three.js, @react-three/fiber, and @react-three/drei. Avoid additional 3D dependencies unless technically necessary.

Implement:
- A Canvas that fills the central viewport and handles resize correctly.
- A perspective camera with constrained orbit controls, a useful default angle, damping, and a Reset View action.
- Procedural studio lighting, contact shadow or a lightweight equivalent, a subtle floor grid, and a dark environment that requires no downloaded HDR.
- A memoized BracketGeometry generated from Three.js Shape and ExtrudeGeometry. The silhouette must look mechanically plausible, include two mounting holes using Shape.holes, bevelled edges, and use millimetres as domain units with a documented scene scale.
- A premium titanium-like physical material, restrained cyan edge treatment, and hover/selection feedback.
- Correct disposal of generated geometry and materials when parameters change or the component unmounts.
- A WebGL-unavailable fallback that keeps the rest of the UI usable.

Do not implement lattice, heatmaps, analysis integration, or STL export yet.

Performance constraints:
- Do not allocate objects inside useFrame unless reused through refs.
- Do not rebuild geometry on camera movement or unrelated UI state changes.
- Cap device pixel ratio to a sensible value.

Acceptance criteria:
- npm run build succeeds with no TypeScript errors.
- Existing frontend tests pass.
- Add focused unit tests for pure geometry-parameter normalization utilities.
- The bracket remains framed when the viewport resizes.

Run verification and fix failures. Suggest, but do not create, the conventional commit: feat(web): render parametric threejs bracket
```

## Prompt 04 — Connect real design controls to the geometry

```text
Mandatory user rules for this phase:
- Communication: speak in concise caveman style in progress and final messages. Never put caveman style into code, identifiers, UI copy, comments, tests, or documentation.
- Apply SOLID. Use strict TDD Red-Green-Refactor: tests first, prove red, implement, prove green, then refactor.
- For .NET and tests, apply Engram topics coding-style-dotnet and unit-test-rules, including static readonly arrays for repeated/hot literal arrays and names like MethodName_should_do_action_when_condition.
- For frontend code, use strict TypeScript, accessible UI, stable references, cleanup, and no avoidable per-frame allocations.
- Documentation: update docs/technical-architecture.md with actual changes, update docs/business-model.md with product implications or explicitly log no change, append exact scope and verification to docs/implementation-log.md, keep planned work separate from implemented behaviour, and report documentation files changed.

Implement phase 04 of Lattice Forge: typed parametric controls connected to the Three.js bracket.

Read AGENTS.md and BUILD_PROMPTS.md first. Preserve the scene and backend.

Create a small Zustand design store containing:
- length, height, depth, wallThickness, holeRadius, and latticeDensity,
- selected process and selected material id,
- view mode,
- actions for setting one value, applying a preset, and resetting defaults.

Implement accessible controls in the left panel:
- Range input plus numeric output for every geometric parameter.
- Explicit millimetre or percentage units.
- Safe min, max, and step values that cannot create an invalid Three.js shape.
- Three presets: Lightweight, Balanced, and Reinforced.
- Reset Design action.
- Process and material controls populated from GET /api/materials, with incompatible materials automatically excluded rather than silently accepted.

Geometry updates must be smooth while dragging. API analysis requests are out of scope for this phase.

Add a compact dimensions overlay in the viewport and a “Modified” indicator when values differ from the active preset.

Acceptance criteria:
- The visible bracket changes for length, height, depth, wall thickness, and hole radius.
- Controls are keyboard operable and have accessible names and current values.
- Store and control tests cover preset, reset, clamping, and process/material compatibility.
- npm run test and npm run build succeed.

Run verification and fix failures. Suggest, but do not create, the conventional commit: feat(web): connect parametric design controls
```

## Prompt 05 — Add the lattice reveal and comparison modes

```text
Mandatory user rules for this phase:
- Communication: speak in concise caveman style in progress and final messages. Never put caveman style into code, identifiers, UI copy, comments, tests, or documentation.
- Apply SOLID. Use strict TDD Red-Green-Refactor: tests first, prove red, implement, prove green, then refactor.
- For .NET and tests, apply Engram topics coding-style-dotnet and unit-test-rules, including static readonly arrays for repeated/hot literal arrays and names like MethodName_should_do_action_when_condition.
- For frontend code, use strict TypeScript, accessible UI, stable references, cleanup, and no avoidable per-frame allocations.
- Documentation: update docs/technical-architecture.md with actual changes, update docs/business-model.md with product implications or explicitly log no change, append exact scope and verification to docs/implementation-log.md, keep planned work separate from implemented behaviour, and report documentation files changed.

Implement phase 05 of Lattice Forge: the visual lightweighting concept using an efficient procedural lattice.

Read AGENTS.md and BUILD_PROMPTS.md first. Preserve current controls and geometry.

Implement a LatticeStructure component that:
- Creates a mechanically plausible repeated diagonal or octet-style pattern inside the bracket bounds.
- Uses InstancedMesh or merged BufferGeometry, never one React component per strut.
- Responds to latticeDensity with bounded instance counts.
- Uses a contrasting titanium/cyan material while remaining visually integrated with the shell.
- Disposes GPU resources correctly.

Add three view modes to the bottom controls:
- Solid: original bracket only.
- Optimized: lightweight shell plus internal lattice.
- Compare: an interactive split plane showing Solid on one side and Optimized on the other.

The split plane must be draggable and keyboard adjustable. Add a subtle luminous boundary where both views meet. Clearly label the lattice as a conceptual visualization rather than a validated printable structure.

Do not add the optimization animation or risk heatmap yet.

Performance acceptance criteria:
- Lattice density has a documented hard maximum.
- No unbounded object creation occurs during dragging.
- Camera interaction stays responsive at maximum supported density.
- npm run test and npm run build succeed.

Add tests for lattice count calculation, bounds, and view-mode state. Run verification and fix failures. Suggest, but do not create, the conventional commit: feat(web): add lattice optimization comparison
```

## Prompt 06 — Integrate live manufacturing analysis

```text
Mandatory user rules for this phase:
- Communication: speak in concise caveman style in progress and final messages. Never put caveman style into code, identifiers, UI copy, comments, tests, or documentation.
- Apply SOLID. Use strict TDD Red-Green-Refactor: tests first, prove red, implement, prove green, then refactor.
- For .NET and tests, apply Engram topics coding-style-dotnet and unit-test-rules, including static readonly arrays for repeated/hot literal arrays and names like MethodName_should_do_action_when_condition.
- For frontend code, use strict TypeScript, accessible UI, stable references, cleanup, and no avoidable per-frame allocations.
- Documentation: update docs/technical-architecture.md with actual changes, update docs/business-model.md with product implications or explicitly log no change, append exact scope and verification to docs/implementation-log.md, keep planned work separate from implemented behaviour, and report documentation files changed.

Implement phase 06 of Lattice Forge: connect the frontend design to the ASP.NET Core manufacturing-analysis API.

Read AGENTS.md and BUILD_PROMPTS.md first. Preserve all current behaviour.

Implement:
- A small typed API client with explicit request and response types.
- A debounced analysis query triggered by valid design, material, or process changes.
- AbortController cancellation so stale requests cannot overwrite newer results.
- Clear loading, success, validation, unavailable, and retry states.
- The right Manufacturing Analysis panel showing:
  - printability score,
  - estimated optimized weight,
  - illustrative cost and print time,
  - material reduction,
  - support risk,
  - warnings and suggested corrections.
- A compact Solid vs Optimized comparison for volume and weight.
- A persistent “Illustrative estimate — not engineering validation” disclosure.

Animate numeric changes subtly without using a large animation library. Respect prefers-reduced-motion.

Do not duplicate the backend equations in the frontend. The UI may format and visualize results but the API is authoritative.

Acceptance criteria:
- Rapid slider changes show only the newest analysis result.
- API errors never crash or blank the Three.js viewport.
- Frontend tests cover debounce/cancellation, success, validation failure, and retry.
- dotnet test LatticeForge.sln succeeds.
- npm run test and npm run build succeed.

Run all verification and fix failures. Suggest, but do not create, the conventional commit: feat(web): display live manufacturing analysis
```

## Prompt 07 — Build the signature optimization scan

```text
Mandatory user rules for this phase:
- Communication: speak in concise caveman style in progress and final messages. Never put caveman style into code, identifiers, UI copy, comments, tests, or documentation.
- Apply SOLID. Use strict TDD Red-Green-Refactor: tests first, prove red, implement, prove green, then refactor.
- For .NET and tests, apply Engram topics coding-style-dotnet and unit-test-rules, including static readonly arrays for repeated/hot literal arrays and names like MethodName_should_do_action_when_condition.
- For frontend code, use strict TypeScript, accessible UI, stable references, cleanup, and no avoidable per-frame allocations.
- Documentation: update docs/technical-architecture.md with actual changes, update docs/business-model.md with product implications or explicitly log no change, append exact scope and verification to docs/implementation-log.md, keep planned work separate from implemented behaviour, and report documentation files changed.

Implement phase 07 of Lattice Forge: the signature “Optimize for Manufacturing” cinematic interaction.

Read AGENTS.md and BUILD_PROMPTS.md first. Preserve application correctness and accessibility.

Add a primary Optimize for Manufacturing action. On activation, run one controlled 2.5–3.5 second sequence:
1. Lock only conflicting view controls, not the whole UI.
2. Sweep a luminous scan plane across the bracket.
3. Reveal the lattice behind the plane while retaining the solid form ahead of it.
4. Reveal an overhang-risk heatmap derived deterministically from surface orientation and process threshold, not random colours.
5. Transition the right panel from baseline metrics to optimized metrics.
6. Finish in Compare mode with the split plane positioned to communicate the before/after result.

Implementation constraints:
- Reuse Three.js vectors, planes, colours, and uniforms in the render loop.
- Keep animation state separate from domain design state.
- Prevent overlapping optimization runs.
- Provide a Skip Animation control.
- Under prefers-reduced-motion, switch immediately with a short opacity transition.
- Heatmap colours must have a legend and a non-colour warning representation.
- If the API analysis fails, the animation may still complete visually but must not invent metrics.

Add a concise first-run hint explaining the action. Do not add particles merely for decoration.

Acceptance criteria:
- Repeated runs produce the same result and no resource leak.
- The scan stays aligned after resize.
- Controls recover after completion, cancellation, or error.
- npm run test and npm run build succeed.

Add focused tests for the animation state machine and reduced-motion path. Run verification and fix failures. Suggest, but do not create, the conventional commit: feat(web): add manufacturing optimization scan
```

## Prompt 08 — Persist designs and export STL

```text
Mandatory user rules for this phase:
- Communication: speak in concise caveman style in progress and final messages. Never put caveman style into code, identifiers, UI copy, comments, tests, or documentation.
- Apply SOLID. Use strict TDD Red-Green-Refactor: tests first, prove red, implement, prove green, then refactor.
- For .NET and tests, apply Engram topics coding-style-dotnet and unit-test-rules, including static readonly arrays for repeated/hot literal arrays and names like MethodName_should_do_action_when_condition.
- For frontend code, use strict TypeScript, accessible UI, stable references, cleanup, and no avoidable per-frame allocations.
- Documentation: update docs/technical-architecture.md with actual changes, update docs/business-model.md with product implications or explicitly log no change, append exact scope and verification to docs/implementation-log.md, keep planned work separate from implemented behaviour, and report documentation files changed.

Implement phase 08 of Lattice Forge: lightweight persistence and export.

Read AGENTS.md and BUILD_PROMPTS.md first. Preserve all existing behaviour.

Backend:
- Add EF Core with SQLite.
- Persist Design records containing id, name, timestamps, bracket parameters, process, material id, and schema version.
- Add POST /api/designs, GET /api/designs, and GET /api/designs/{id}.
- Validate names and all restored parameters using the same domain rules as analysis.
- Add a startup migration strategy appropriate for a local demo and document its tradeoff.
- Add API tests using an isolated SQLite database, not the developer database.

Frontend:
- Add Save Design with a small accessible name dialog.
- Add a compact Recent Designs popover and load action.
- Add Export STL using Three.js STLExporter for the visible optimized geometry.
- Add Export Design JSON containing parameters, material/process selection, schema version, and an illustrative-data disclaimer.
- Sanitize filenames and make export failures visible.

Be honest in the UI and README: the conceptual lattice export is a demo mesh and has not been checked for watertightness or printability.

Acceptance criteria:
- A design survives API restart and restores the same parameters.
- Invalid persisted or posted values are rejected safely.
- Save/load/export do not reset the camera unexpectedly.
- dotnet test LatticeForge.sln succeeds.
- npm run test and npm run build succeeds.

Run verification and fix failures. Suggest, but do not create, the conventional commit: feat: persist and export lattice designs
```

## Prompt 09 — Harden responsiveness, accessibility, and performance

```text
Mandatory user rules for this phase:
- Communication: speak in concise caveman style in progress and final messages. Never put caveman style into code, identifiers, UI copy, comments, tests, or documentation.
- Apply SOLID. Use strict TDD Red-Green-Refactor: tests first, prove red, implement, prove green, then refactor.
- For .NET and tests, apply Engram topics coding-style-dotnet and unit-test-rules, including static readonly arrays for repeated/hot literal arrays and names like MethodName_should_do_action_when_condition.
- For frontend code, use strict TypeScript, accessible UI, stable references, cleanup, and no avoidable per-frame allocations.
- Documentation: update docs/technical-architecture.md with actual changes, update docs/business-model.md with product implications or explicitly log no change, append exact scope and verification to docs/implementation-log.md, keep planned work separate from implemented behaviour, and report documentation files changed.

Implement phase 09 of Lattice Forge: production-style hardening without adding product features.

Read AGENTS.md and BUILD_PROMPTS.md first. Audit the current implementation before editing.

Focus only on:
- Responsive layouts for 1440x900, 1280x720, 1024x768, and a narrow 390px fallback.
- Keyboard reachability and visible focus for every non-canvas control.
- Accessible names, status announcements, dialogs, legends, and error messages.
- prefers-reduced-motion support across CSS and Three.js animation.
- Resize correctness and handling WebGL context loss/restoration where practical.
- Preventing unnecessary React renders and geometry/material regeneration.
- Capping DPR, lattice instances, shadow cost, and post-processing cost.
- Clear empty, loading, offline, and API-validation states.

Do not degrade the desktop visual presentation to make mobile perfect. On narrow screens, prioritize a stable read-only viewport plus collapsible controls.

Run a dependency audit and resolve only directly actionable issues that do not force risky major upgrades. Do not claim zero vulnerabilities if the tool cannot prove it.

Acceptance criteria:
- dotnet build and dotnet test succeed.
- npm run test and npm run build succeed.
- No console error appears during the primary flow.
- The main flow is usable with keyboard only outside raw 3D orbit interaction.
- Document remaining browser, accessibility, and performance limitations.

Run verification and fix failures. Suggest, but do not create, the conventional commit: fix: harden lattice forge experience
```

## Prompt 10 — Prepare the interview delivery

```text
Mandatory user rules for this phase:
- Communication: speak in concise caveman style in progress and final messages. Never put caveman style into code, identifiers, UI copy, comments, tests, or documentation.
- Apply SOLID. Use strict TDD Red-Green-Refactor: tests first, prove red, implement, prove green, then refactor.
- For .NET and tests, apply Engram topics coding-style-dotnet and unit-test-rules, including static readonly arrays for repeated/hot literal arrays and names like MethodName_should_do_action_when_condition.
- For frontend code, use strict TypeScript, accessible UI, stable references, cleanup, and no avoidable per-frame allocations.
- Documentation: update docs/technical-architecture.md with actual changes, update docs/business-model.md with product implications or explicitly log no change, append exact scope and verification to docs/implementation-log.md, keep planned work separate from implemented behaviour, and report documentation files changed.

Implement phase 10 of Lattice Forge: make the repository and demo interview-ready. Do not add new product capabilities.

Read AGENTS.md and BUILD_PROMPTS.md first. Inspect the complete application.

Update README.md so a reviewer can understand the project in under three minutes. Include:
- one-sentence product pitch,
- a screenshot placeholder only if no verified screenshot can be generated,
- architecture diagram using Mermaid,
- exact local setup and run commands,
- API endpoints,
- domain equations and unit assumptions,
- why React Three Fiber was used while retaining direct Three.js APIs,
- performance decisions such as InstancedMesh and memoized geometry,
- accessibility decisions,
- testing commands,
- explicit illustrative-estimate and non-watertight-lattice limitations,
- a short “What I would build next” section limited to genuine production gaps.

Create docs/INTERVIEW_SCRIPT.md containing:
- a 90-second demo script,
- a five-minute technical walkthrough,
- likely senior-level questions and concise evidence-based answers,
- known tradeoffs and why they were accepted for a one-day demo.

Add a root PowerShell development script that starts API and web development servers, stops both when interrupted, uses absolute resolved paths safely, and opens no visible helper window. Keep the existing manual commands documented as a fallback.

Run the entire verification suite. Fix documentation or script errors before finishing. Suggest, but do not create, the conventional commit: docs: prepare lattice forge interview walkthrough
```

## Prompt 11 — Fresh-context adversarial review and repair

Run this prompt in a **new Codex task** using GPT-5.6 Luna / High.

```text
Mandatory user rules for this phase:
- Communication: speak in concise caveman style in progress and final messages. Never put caveman style into code, identifiers, UI copy, comments, tests, or documentation.
- Apply SOLID. Use strict TDD Red-Green-Refactor: tests first, prove red, implement, prove green, then refactor.
- For .NET and tests, apply Engram topics coding-style-dotnet and unit-test-rules, including static readonly arrays for repeated/hot literal arrays and names like MethodName_should_do_action_when_condition.
- For frontend code, use strict TypeScript, accessible UI, stable references, cleanup, and no avoidable per-frame allocations.
- Documentation: update docs/technical-architecture.md with actual changes, update docs/business-model.md with product implications or explicitly log no change, append exact scope and verification to docs/implementation-log.md, keep planned work separate from implemented behaviour, and report documentation files changed.

Perform a fresh-context release review of the Lattice Forge repository. This is an adversarial review followed by targeted repair, not a redesign.

Read AGENTS.md, BUILD_PROMPTS.md, README.md, and docs/INTERVIEW_SCRIPT.md. Inspect the full diff and implementation.

Review for:
- broken startup or incorrect commands,
- frontend/backend contract mismatches,
- incorrect units or non-monotonic analysis calculations,
- stale-request races,
- React lifecycle and Three.js GPU resource leaks,
- excessive per-frame allocations,
- invalid geometry edge cases,
- SQLite persistence and validation problems,
- misleading manufacturing claims,
- keyboard, focus, contrast, and reduced-motion defects,
- responsive layout breakage,
- unsafe export filenames or unhandled failures,
- missing or meaningless tests,
- interview demo flow failures.

Classify findings as Critical, Warning, or Suggestion. Fix every confirmed Critical issue and every low-risk confirmed Warning. Do not perform broad rewrites, dependency migrations, or aesthetic redesigns.

Then run:
- dotnet build LatticeForge.sln
- dotnet test LatticeForge.sln
- npm run test in src/LatticeForge.Web
- npm run build in src/LatticeForge.Web

Finish with:
1. findings and evidence,
2. fixes made,
3. exact verification results,
4. remaining known risks,
5. a go/no-go recommendation for the interview demo.

Do not add AI attribution or Co-Authored-By metadata. Suggest, but do not create, the conventional commit: fix: address lattice forge release review
```

## Fast path if time is running out

Execute prompts **00–07, 09, 10, and 11**. Skip prompt 08. Persistence and STL export are valuable, but the interview impact comes primarily from the 3D interaction, coherent .NET analysis, visual optimization scan, and ability to explain the architecture.

## Final go/no-go checklist

- [ ] A clean checkout can be started using README commands.
- [ ] The bracket renders without remote runtime assets.
- [ ] Parameter changes remain inside valid geometry bounds.
- [ ] API results are deterministic, tested, and explicitly illustrative.
- [ ] The lattice uses instancing or merged geometry.
- [ ] The optimization scan works repeatedly and respects reduced motion.
- [ ] API failure never invents metrics or destroys the 3D experience.
- [ ] The primary demo works at 1280x720.
- [ ] All build and test commands pass.
- [ ] The presenter can explain the biggest shortcuts honestly.
