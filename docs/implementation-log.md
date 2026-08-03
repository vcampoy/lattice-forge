# Implementation log

This append-only log records what each build phase actually delivered. Planned work belongs in [the build prompts](../BUILD_PROMPTS.md), not in completed-phase entries.

## Phase 00 — Full-stack foundation

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
| `dotnet test LatticeForge.sln` | Passed — 1 test |
| `npm install` in `src/LatticeForge.Web` | Passed |
| `npm run build` in `src/LatticeForge.Web` | Passed |

### Phase 00 decisions and tradeoffs

- Used a development proxy instead of broad API CORS configuration.
- Kept the first phase free of Three.js, persistence, and manufacturing logic to establish a verifiable foundation.
- Applied TDD to the health contract: the endpoint test first failed with HTTP 404, then passed after the endpoint was implemented.

## Phase 01 — Illustrative manufacturing analysis

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
| `dotnet test LatticeForge.sln` | Passed — 12 tests |

### Phase 01 decisions and tradeoffs

- Kept equations in `ManufacturingAnalysisService`, not in HTTP endpoints.
- Used deterministic heuristics so interactions are repeatable while marking every result as illustrative.
- Used an in-memory catalogue because persistence is intentionally deferred.
- Accepted below-minimum wall thickness with a visible warning; impossible geometry and incompatible material/process combinations are rejected.
- Followed Red–Green–Refactor: tests defined the domain and endpoint behaviours before implementation, then the full suite was returned to green.

## Phase 02 — Industrial workspace shell

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
| `npm test` in `src/LatticeForge.Web` | Passed — 2 tests |
| `npm run build` in `src/LatticeForge.Web` | Passed |
| `npm run lint` in `src/LatticeForge.Web` | Passed |

### Phase 02 decisions and tradeoffs

- Kept the shell in one page with small presentational helpers to make the phase easy to review before Three.js introduces a separate rendering boundary.
- Used Zustand only for view-mode and grid toggles; geometry and manufacturing state remain outside the UI until their API contracts are connected.
- Used CSS placeholder geometry so the interview narrative is visible without prematurely coupling the shell to a rendering engine.
- Followed Red–Green–Refactor: component tests first failed against the foundation screen, the shell was implemented, and the tests/build/lint suite returned to green.

### Business impact

No business model, target persona, pricing assumption, or safety boundary changed. The shell only makes the intended early-design conversation legible; all analysis values remain explicitly pending.

## Next phase

Phase 04 will connect shared design controls to the Three.js scene and preserve this shell boundary.

## Phase 03 — Parametric Three.js bracket viewport

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
| `npm test` in `src/LatticeForge.Web` | Passed — 4 tests |
| `npm run build` in `src/LatticeForge.Web` | Passed (Vite emitted a non-blocking large-chunk advisory) |
| `npm run lint` in `src/LatticeForge.Web` | Passed |
| `dotnet test LatticeForge.sln` | Passed — 12 tests |

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
