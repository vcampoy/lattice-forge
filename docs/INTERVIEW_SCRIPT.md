# Lattice Forge interview script

## 90-second demo

“Lattice Forge is a small DfAM workspace for an early design conversation. I start with a parametric mechanical bracket and change its dimensions using bounded, keyboard-accessible controls. The Three.js viewport updates the solid geometry immediately, while the ASP.NET Core API remains the authority for deterministic manufacturing estimates.

I switch to the optimized view to reveal a deliberately bounded conceptual lattice. The `Optimize for Manufacturing` action then runs a controlled scan: a plane sweeps across the part, the lattice is revealed, and a deterministic overhang-risk heatmap appears with both a legend and text risk representation. The final compare view makes the solid-versus-optimized intent obvious.

The right panel reports score, weight, cost, time, material reduction, support risk, and warnings. Those numbers are explicitly illustrative; they are not machine simulation or engineering validation. I can save the validated design, restore it after an API restart, and export a conceptual STL or JSON snapshot. The important story is the boundary: React and Three.js own interaction and presentation, while the .NET API owns validation, equations, and persistence contracts.”

## Five-minute technical walkthrough

### 1. Product and boundaries

The target user is a designer or reviewer exploring lightweighting options before detailed engineering. The product deliberately stops at an explainable, deterministic interaction model. It does not claim certified printability, machine settings, or Materialise affiliation.

### 2. Frontend architecture

React 19 and Zustand own the application and design state. React Three Fiber provides the declarative canvas boundary. Geometry modules use direct Three.js APIs for shape construction, clipping planes, instancing, material reuse, and disposal. This split keeps domain state out of the render loop and makes GPU lifetime visible in code.

The analysis hook creates a typed request, debounces changes, cancels stale fetches with `AbortController`, and guards result ordering. API failures become visible loading, validation, unavailable, retry, or error states without destroying the viewport. The optimization sequence is a small presentation state machine, separate from design state, so repeated runs and reduced motion are predictable.

### 3. Backend architecture

`src/LatticeForge.Api/Program.cs` is the composition root for five backend projects. API controllers are inbound adapters that call six `I*UseCase` interfaces; the UseCase project depends only on Domain and owns validation, the material catalogue, and deterministic calculations. Shared records live under `Domain/Dtos`, while `IDesignRepository` and `IDateTimeProvider` keep application workflows independent of concrete persistence and system time.

Services supplies `DesignRepository`, `DesignMapper`, and `DateTimeProvider`; `DesignRepository` is the EF Core-backed adapter that depends on `DesignDbContext`. Infrastructure owns `DesignDbContext`, EF Core model configuration, SQLite registration, and database bootstrap. The adapter crosses that boundary without exposing EF Core to the use cases. The local demo uses `EnsureCreated` at startup because it is easy to explain and deterministic for a one-day interview project. A production system would use reviewed migrations, a proper data boundary, backups, and concurrency/authorization decisions.

### 4. Performance and accessibility

The lattice is one bounded `InstancedMesh`, not hundreds of React components. Geometry and materials are memoized and disposed explicitly. Device pixel ratio and lattice instance count are capped, narrow screens disable expensive shadows, and there is no post-processing pipeline. Compare mode uses clipping planes while dragging.

The non-canvas workflow uses native controls, visible focus, accessible names, status announcements, validation associations, collapsible narrow-screen panels, reduced-motion CSS and Three.js behavior, and a heatmap legend with non-colour text. Raw orbit manipulation remains a 3D interaction rather than pretending a keyboard can replace every camera gesture.

### 5. Verification and honest tradeoffs

The repository has xUnit tests for use cases, controllers, the composed host, the clock, and isolated SQLite persistence. Vitest/Testing Library tests protect stores, API cancellation, persistence, geometry, optimization, controls, and exports. The normal verification commands are `dotnet build`, `dotnet test`, `pnpm test`, `pnpm build`, and `pnpm lint`.

The biggest accepted shortcuts are heuristic manufacturing equations, a conceptual lattice, local SQLite, no full browser/device matrix, and a production bundle that still has a Vite chunk advisory. They are documented instead of hidden because a senior engineer should make the boundary explicit.

## Likely senior-level questions

### Why not put the equations in React?

Because two calculation authorities would drift. The API validates and calculates; the client formats and visualizes the response. The typed client contract makes the boundary testable.

### How do you prevent stale slider results?

Each analysis request gets an `AbortController`, a debounce prevents request storms, and a sequence guard prevents an older response from winning even if cancellation races with a completed response.

### Why React Three Fiber instead of imperative Three.js everywhere?

R3F integrates the canvas with React lifecycle and declarative scene composition. Direct Three.js remains where explicit geometry, clipping, instancing, and disposal are the important concerns. The choice is a boundary, not a surrender of control.

### Why is the lattice not production-ready?

It is a bounded diagonal-cell visualization optimized for a repeatable interview flow. It is not a topology optimizer, does not prove structural performance, and has not been checked for watertightness or printability. A production version needs validated generation and geometry/manufacturability checks.

### Why `EnsureCreated` instead of migrations?

The demo needs restart persistence with minimal setup. `EnsureCreated` is deterministic for a disposable local database, but it does not provide a safe schema evolution strategy. Production would use reviewed migrations and deployment policy.

### What happens when the API is down?

The viewport and local design interaction remain available. The analysis panel reports unavailable/retry state and never fabricates metrics. Materials have a bounded fallback for UI continuity, while the API remains authoritative when reachable.

### How did you think about accessibility in a 3D UI?

I made the surrounding workflow keyboard and screen-reader friendly: native controls, focus-visible styles, labels, live statuses, dialog behavior, legends, and non-colour warnings. I document raw orbit as a remaining limitation rather than claiming the canvas itself is fully operable without a pointer.

### What would you change first for production?

I would replace heuristic equations with versioned validated models, define an operational persistence and authorization boundary, validate watertight exports, add browser/device and WebGL regression coverage, and instrument performance before adding more visual features.

## Tradeoffs accepted for a one-day demo

| Decision | Why it was accepted | Production follow-up |
|---|---|---|
| Deterministic heuristic estimates | Makes the interaction explainable and testable in an interview | Validate models against process data and expose model versions |
| One bounded instanced lattice | Gives a strong visual without a topology solver | Implement validated lattice generation and geometry checks |
| Local SQLite with `EnsureCreated` | Zero-configuration restart persistence | Use EF migrations, backups, and concurrency policy |
| Vite proxy and local processes | Fast, transparent developer setup | Add deployment configuration, observability, and CI smoke tests |
| No heavy state/query/animation library | Keeps the architecture small and the lifecycle visible | Reassess only when product scale justifies the dependency cost |
| Manual browser/device QA limitation | Time was invested in core interaction and contracts | Add Playwright, accessibility, visual, and WebGL recovery coverage |
