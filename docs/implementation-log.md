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

## Next phase

Phase 02 will build the visual application shell and design system without introducing the 3D scene. It must update the technical architecture, record any business implications or explicitly state that none changed, and append its exact verification results here.
