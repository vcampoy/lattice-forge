# Implementation log

This append-only log records what each build phase actually delivered. Planned work belongs in [the build prompts](../prompts/BUILD_PROMPTS.md), not in completed-phase entries.

## Phase 00 â€” Full-stack foundation

**Status:** Implemented

### Phase 00 delivered

- Created the .NET 10 solution, ASP.NET Core API, React/TypeScript/Vite client, and xUnit test project.
- Added `GET /api/health` with a typed JSON response.
- Configured the Vite development server on port 5173 to proxy `/api` to the API on port 5100.
- Replaced template content with a branded foundation screen and API availability state.
- Added baseline repository configuration for formatting and generated-file exclusions.

### Phase 00 verification

| Command | Result |
|---|---|
| `dotnet build LatticeForge.sln` | Passed |
| `dotnet test LatticeForge.sln` | Passed â€” 1 test |
| `npm install` in `src/LatticeForge.Web` | Passed |
| `npm run build` in `src/LatticeForge.Web` | Passed |

### Phase 00 decisions and tradeoffs

- Used a development proxy instead of broad API CORS configuration.
- Kept the first phase free of Three.js, persistence, and manufacturing logic to establish a verifiable foundation.
- Applied TDD to the health contract: the endpoint test first failed with HTTP 404, then passed after the endpoint was implemented.

## Phase 01 â€” Illustrative manufacturing analysis

**Status:** Implemented

### Phase 01 delivered

- Added bracket parameters, process values, material profiles, and analysis-result contracts.
- Added a deterministic in-memory catalogue with one example material per process.
- Added `GET /api/materials` and `POST /api/analyses`.
- Added a dedicated analysis service with explicit units, monotonic density and thickness behaviour, score clamping, material compatibility, and dimensional validation.
- Added HTTP 400 Problem Details for invalid analysis requests and warnings for sub-minimum wall thickness.

### Phase 01 verification

| Command | Result |
|---|---|
| `dotnet build LatticeForge.sln` | Passed |
| `dotnet test LatticeForge.sln` | Passed â€” 12 tests |

### Phase 01 decisions and tradeoffs

- Kept equations in `ManufacturingAnalysisService`, not in HTTP endpoints.
- Used deterministic heuristics so interactions are repeatable while marking every result as illustrative.
- Used an in-memory catalogue because persistence is intentionally deferred.
- Accepted below-minimum wall thickness with a visible warning; impossible geometry and incompatible material/process combinations are rejected.
- Followed Redâ€“Greenâ€“Refactor: tests defined the domain and endpoint behaviours before implementation, then the full suite was returned to green.

## Phase 02 â€” Industrial workspace shell

**Status:** Implemented

### Phase 02 delivered

- Added Zustand for small, explicit viewport UI state (`orbit`, `front`, `section`, and grid visibility).
- Added Lucide React icons as inline SVG components; no external runtime assets were introduced.
- Replaced the foundation screen with a full-viewport industrial workspace: top header and connection status, Design Controls panel, CSS viewport placeholder, Manufacturing Analysis panel, and bottom view toolbar.
- Added graphite/titanium tokens, cyan accent, restrained amber warning state, technical grid, atmospheric treatment, and visible keyboard focus styles.
- Added responsive layouts that collapse to stacked panels below 820px and a single-column flow below 560px.
- Added Vitest + Testing Library component tests for major regions, accessible names, and empty analysis states.
- Kept controls presentational and did not add Three.js, geometry behaviour, or analysis integration.

### Phase 02 verification

| Command | Result |
|---|---|
| `npm install` in `src/LatticeForge.Web` | Passed |
| `npm test` in `src/LatticeForge.Web` | Passed â€” 2 tests |
| `npm run build` in `src/LatticeForge.Web` | Passed |
| `npm run lint` in `src/LatticeForge.Web` | Passed |

### Phase 02 decisions and tradeoffs

- Kept the shell in one page with small presentational helpers to make the phase easy to review before Three.js introduces a separate rendering boundary.
- Used Zustand only for view-mode and grid toggles; geometry and manufacturing state remain outside the UI until their API contracts are connected.
- Used CSS placeholder geometry so the interview narrative is visible without prematurely coupling the shell to a rendering engine.
- Followed Redâ€“Greenâ€“Refactor: component tests first failed against the foundation screen, the shell was implemented, and the tests/build/lint suite returned to green.

### Business impact

No business model, target persona, pricing assumption, or safety boundary changed. The shell only makes the intended early-design conversation legible; all analysis values remain explicitly pending.

## Next phase

Phase 04 will connect shared design controls to the Three.js scene and preserve this shell boundary.

## Phase 03 â€” Parametric Three.js bracket viewport

**Status:** Implemented

### Phase 03 delivered

- Installed Three.js, React Three Fiber, Drei, and Three.js type definitions.
- Replaced the CSS placeholder with a responsive Canvas that caps device pixel ratio at 1.75 and uses a WebGL capability fallback.
- Added a constrained, damped orbit camera with orbit/front/section framing and Reset view action.
- Added procedural studio lights, contact shadows, local floor grid, and no remote HDR/runtime assets.
- Added memoized, millimetre-scale `Shape` + `ExtrudeGeometry` bracket generation with two `Shape.holes`, bevels, titanium-like physical material, cyan edges, and hover/selection feedback.
- Added explicit geometry/material disposal and pure `normalizeBracketParameters` tests before Three.js construction.
- Kept lattice, heatmaps, API analysis integration, control wiring, persistence, and STL export out of scope.

### Phase 03 verification

| Command | Result |
|---|---|
| `npm test` in `src/LatticeForge.Web` | Passed â€” 4 tests |
| `npm run build` in `src/LatticeForge.Web` | Passed (Vite emitted a non-blocking large-chunk advisory) |
| `npm run lint` in `src/LatticeForge.Web` | Passed |
| `dotnet test LatticeForge.sln` | Passed â€” 12 tests |

### Phase 03 decisions and tradeoffs

- Kept geometry parameters on phase-03 defaults so phase 04 can introduce one shared design store without duplicating state.
- Used direct Three.js geometry/material APIs inside small React Three Fiber boundaries to make disposal and memoization explicit.
- Used procedural lighting and contact shadows rather than remote HDR assets to keep the interview demo deterministic and offline-friendly.
- Added a jsdom WebGL guard so component tests do not attempt unsupported canvas contexts; production browsers still perform capability detection.
- Business impact: the central visual now communicates inspectable 3D design intent, but metrics remain pending and no engineering or Materialise affiliation claim was added.

### Documentation changed

- `docs/technical-architecture.md`
- `docs/business-model.md`
- `docs/implementation-log.md`

## Phase 04 â€” Live parametric design controls

**Status:** Implemented

### Phase 04 delivered

- Added typed Zustand design state for five bracket dimensions, lattice density, process/material selection, camera/design view state, active preset, reset, clamping, and modified detection.
- Added Lightweight, Balanced, and Reinforced presets plus Reset Design.
- Replaced presentational controls with accessible paired range/numeric inputs, explicit mm/% units, safe bounds, dynamic wall/hole limits, and keyboard-operable native controls.
- Loaded material profiles from `GET /api/materials`; incompatible material options are excluded when process changes and a compatible catalogue entry is selected.
- Passed normalized design parameters through `ThreeViewport` and `BracketScene` to procedural `BracketGeometry`; length, height, depth, wall thickness, and hole radius update live while dragging.
- Added dimensions overlay and Modified/Balanced status indicator. API analysis requests, lattice, persistence, export, and optimization animation remain out of scope.

### Phase 04 verification

| Command | Result |
|---|---|
| `npm test` in `src/LatticeForge.Web` | Passed â€” 13 tests |
| `npm run build` in `src/LatticeForge.Web` | Passed (Vite emitted a non-blocking large-chunk advisory) |
| `npm run lint` in `src/LatticeForge.Web` | Passed |
| `dotnet test LatticeForge.sln --no-restore` | Environment blocked test DLL loading with Windows Application Control (`0x800711C7`); not a product failure and not claimed as passed |

### Phase 04 decisions and tradeoffs

- Kept local design state separate from the API analysis contract so dragging stays responsive and phase 05 can add lattice/analysis without rewriting the rendering boundary.
- Used native range/number/select controls for reliable keyboard and screen-reader behaviour instead of a custom slider abstraction.
- Used a deterministic fallback material catalogue only when the materials request is unavailable; successful API data always replaces it.
- Followed Redâ€“Greenâ€“Refactor: store and control tests were added and observed failing before implementation, then the focused and full frontend suites returned to green.

### Business impact

Phase 04 turns the prototype from a static viewport into an explorable design conversation: stakeholders can change bounded dimensions and see the bracket respond immediately, while process/material compatibility prevents an obviously invalid pairing. This improves demo value but does not add engineering-grade analysis or commercial claims.

### Documentation changed

- `docs/README.md`
- `docs/technical-architecture.md`
- `docs/business-model.md`
- `docs/implementation-log.md`

## Phase 05 — Lattice reveal and comparison modes

**Status:** Implemented

### Phase 05 delivered

- Added a pure bounded diagonal lattice generator with a documented hard maximum of 512 instanced struts.
- Added a single `InstancedMesh` lattice renderer with memoized geometry/material and explicit GPU disposal.
- Added Solid, Optimized, and Compare design-view controls to the bottom toolbar.
- Added a draggable and keyboard-adjustable compare split handle with an in-scene luminous boundary and opposing local clipping planes.
- Labelled the lattice as a conceptual visualization; no printability or optimization claim was added.
- Preserved phase 00–04 API, controls, geometry, and responsive shell behaviour.

### Phase 05 verification

| Command | Result |
|---|---|
| `npm test` in `src/LatticeForge.Web` | Passed — 18 tests |
| `npm run build` in `src/LatticeForge.Web` | Passed (Vite emitted a non-blocking large-chunk advisory) |
| `npm run lint` in `src/LatticeForge.Web` | Passed |
| `dotnet test LatticeForge.sln --no-restore` | Passed — 12 tests |

### Phase 05 decisions and tradeoffs

- Used diagonal cell pairs rather than a full octet-truss solver to keep the interview visual deterministic and bounded; this is not a manufacturing-ready lattice.
- Used material clipping planes for compare mode instead of duplicating or rebuilding geometry during dragging, keeping pointer interaction responsive.
- Kept split state local to the viewport presentation boundary; design parameters remain owned by the Zustand store.

### Business impact

Phase 05 makes the lightweighting story visible in one gesture and supports a before/after conversation. It adds no pricing, engineering validation, or production capability.

### Documentation changed

- `docs/technical-architecture.md`
- `docs/business-model.md`
- `docs/implementation-log.md`

## Phase 06 â€” Live manufacturing analysis integration

**Status:** Implemented

### Delivered

- Added a typed `POST /api/analyses` client with explicit request/response/error contracts.
- Added a 320 ms debounce, per-request `AbortController`, sequence guard, and retry action so stale slider requests cannot overwrite current results.
- Added explicit idle, loading, success, validation, unavailable, and generic error states without affecting the Three.js viewport.
- Replaced placeholder metrics with API-authoritative score, optimized weight, illustrative cost/time, material reduction, support risk, warnings, suggested corrections, and Solid-versus-Optimized volume/weight comparison.
- Kept the illustrative-estimate disclosure persistent and added reduced-motion-safe CSS numeric transitions.
- Normalized the UI's 0â€“100% lattice-density control to the API's 0â€“1 request contract; frontend equations remain absent.

### Verification

| Command | Result |
|---|---|
| `npm test` in `src/LatticeForge.Web` | Passed â€” 7 files, 24 tests |
| `npm run build` in `src/LatticeForge.Web` | Passed (Vite emitted a non-blocking large-chunk advisory) |
| `npm run lint` in `src/LatticeForge.Web` | Passed |
| `dotnet test LatticeForge.sln --no-restore` | Passed â€” 12 tests |

### Decisions and tradeoffs

- Kept API orchestration in a hook and rendering in a panel so SOLID boundaries remain clear and the viewport is resilient to API failure.
- Used native `fetch`, `AbortController`, and CSS transitions instead of adding a query or animation library for this interview-scale workflow.
- Kept API validation visible with retry guidance; no fabricated fallback analysis is shown.

### Documentation changed

- `docs/technical-architecture.md`
- `docs/business-model.md`
- `docs/implementation-log.md`

## Phase 07 ? Signature optimization scan

**Status:** Implemented

### Delivered

- Added the Optimize for Manufacturing action with a bounded cinematic scan, lattice reveal, deterministic risk heatmap, and Compare-mode finish.
- Added a presentation-only optimization state machine with overlap protection, Skip Animation, cancellation, resize-safe scan alignment, and reduced-motion handling.
- Added deterministic heatmap risk calculation derived from surface orientation and process thresholds, plus a legend and non-colour warning representation.
- Kept API metrics authoritative: visual completion does not invent optimized values when analysis fails.
- Added first-run guidance and preserved independent design controls and viewport usability.

### Verification

| Command | Result |
|---|---|
| `npm test` in `src/LatticeForge.Web` | Passed - 10 files, 34 tests |
| `npm run build` in `src/LatticeForge.Web` | Passed (Vite emitted a non-blocking large-chunk advisory) |
| `npm run lint` in `src/LatticeForge.Web` | Passed (existing fast-refresh warning only) |
| `dotnet test LatticeForge.sln --no-restore` | Passed ? 12 tests |

### Documentation changed

- `docs/README.md`
- `docs/technical-architecture.md`
- `docs/business-model.md`
- `docs/implementation-log.md`


## Frontend package-management migration - npm to pnpm

**Status:** Implemented

### Delivered

- Pinned the frontend package manager to pnpm `10.33.1` in `src/LatticeForge.Web/package.json`.
- Imported the tracked npm lockfile into `src/LatticeForge.Web/pnpm-lock.yaml`, then removed `package-lock.json` after successful generation.
- Updated the frontend launcher and active setup/build/test documentation to use pnpm.
- Added the local frontend package-management architecture note and recorded that the tooling change has no product, pricing, or manufacturing-model impact.
- Kept the lockfile local to the only JavaScript package; no root package, workspace file, or CI configuration was introduced.

### TDD evidence

The required RED command was run before migration:

```text
pnpm install --frozen-lockfile
```

It failed as expected with `ERR_PNPM_NO_LOCKFILE Cannot install with "frozen-lockfile" because pnpm-lock.yaml is absent`.

### Verification

| Command | Result |
|---|---|
| `pnpm install --frozen-lockfile` | Passed with pnpm `10.33.1`; lockfile unchanged and no npm lockfile recreated |
| `pnpm test` | Passed - 10 files, 34 tests |
| `pnpm build` | Passed; Vite emitted the existing non-blocking large-chunk advisory |
| `pnpm lint` | Passed; existing `react(only-export-components)` warning remains in `src/geometry/BracketGeometry.tsx` |
| `dotnet test LatticeForge.sln --no-restore` | Passed - 12 tests |
| PowerShell parser validation | Passed for `scripts/start-backend.ps1` and `scripts/start-frontend.ps1` |
| `git diff --check` | Passed |

### Dependency-resolution note

The pnpm lockfile preserves the existing resolved versions. `three-stdlib@2.36.1` is declared directly because the existing frontend imports its type from `BracketScene.tsx`; the same version was already present transitively in the npm lockfile.

### Documentation changed

- `README.md`
- `docs/technical-architecture.md`
- `docs/business-model.md`
- `docs/implementation-log.md`
- `docs/README.md`
- `prompts/BUILD_PROMPTS.md`

## Phase 08 — Persist designs and export STL

**Status:** Implemented

### Delivered

- Added EF Core SQLite persistence with versioned DesignEntity snapshots and POST /api/designs, GET /api/designs, and GET /api/designs/{id}.
- Reused manufacturing validation for posted and restored designs, including safe handling of corrupted persisted parameters.
- Added deterministic local EnsureCreated() startup bootstrap and documented that production would require reviewed migrations.
- Added accessible Save Design and Recent Designs controls that restore parameters without resetting camera/view state.
- Added sanitized STL export of temporary optimized shell+lattice geometry and JSON export with schema metadata and illustrative-data disclaimer.
- Added visible persistence/export status and error messages and documented the non-watertight/non-printability-validated lattice limitation.

### TDD evidence

The phase tests cover creation, restart restoration, validation, corrupted rows, ordering, save dialog behaviour, recent-design loading, state restoration, filename sanitization, JSON metadata, and optimized export scene construction.

### Verification

| Command | Result |
|---|---|
| dotnet test LatticeForge.sln | Passed — 19 tests; restore reports existing NU1903 SQLite vulnerability warning |
| pnpm test in src/LatticeForge.Web | Passed — 12 files, 42 tests |
| pnpm build in src/LatticeForge.Web | Passed; Vite emitted the existing non-blocking large-chunk advisory |

### Decisions and tradeoffs

- Used a local SQLite file and EnsureCreated() because the interview demo needs restart persistence with minimal operational setup; this is not the production migration strategy.
- Kept export generation isolated from the live viewport by building and disposing a temporary scene, so export does not mutate camera or render state.
- Export remains explicitly conceptual: no watertightness, printability, or engineering-grade manufacturing validation is claimed.

### Documentation changed

- README.md
- docs/technical-architecture.md
- docs/business-model.md
- docs/implementation-log.md
## Phase 09 — Harden responsiveness, accessibility, and performance

**Status:** Implemented

### Delivered

- Added independently collapsible Design Controls and Manufacturing Analysis panels for narrow layouts while preserving the viewport.
- Added accessible expanded state, focus handling, dialog focus trap, validation error association, live status messages, and keyboard compare-split controls.
- Added reduced-motion propagation to the Three.js camera controls and CSS motion suppression.
- Added WebGL context loss/restoration handling and explicit fallback/error states.
- Added a bounded rendering budget for DPR, lattice instance counts, and desktop versus narrow shadow cost.
- Reduced avoidable React/Three.js work by memoizing stable parameter objects and fixing effect dependencies.
- Audited dependencies without risky major upgrades; no known production dependency vulnerabilities were reported by pnpm audit.

### Verification

| Command | Result |
|---|---|
| dotnet build LatticeForge.sln | Passed; existing NU1903 SQLite vulnerability warning |
| dotnet test LatticeForge.sln | Passed — 19 tests; existing NU1903 warning |
| pnpm test in src/LatticeForge.Web | Passed — 13 files, 45 tests |
| pnpm build in src/LatticeForge.Web | Passed; Vite emitted the existing non-blocking large-chunk advisory |
| pnpm lint in src/LatticeForge.Web | Passed; existing Fast Refresh warning remains in BracketGeometry.tsx |
| pnpm audit --prod --audit-level high in src/LatticeForge.Web | Passed — no known vulnerabilities found |
| git diff --check | Passed |

### Remaining limitations

- Vitest does not prove the real browser/device matrix, WebGL context recovery, or screen-reader announcements.
- Raw Three.js orbit interaction remains pointer-oriented; all surrounding controls are keyboard reachable.
- The Vite production bundle remains above the 500 kB advisory threshold.
- SQLitePCLRaw.lib.e_sqlite3 still reports NU1903 through the current .NET dependency graph.

### Documentation changed

- docs/technical-architecture.md
- docs/business-model.md
- docs/implementation-log.md