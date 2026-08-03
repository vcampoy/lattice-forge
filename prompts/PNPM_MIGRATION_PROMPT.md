# Migrate the frontend from npm to pnpm

Execute the npm-to-pnpm migration for Lattice Forge.

Repository: `C:\Source\materialise`

## Mandatory rules

- Communicate in concise caveman style in progress and final messages.
- Never use caveman style in code, scripts, documentation, identifiers, or error messages.
- Apply SOLID.
- Follow strict Red-Green-Refactor.
- Apply the Engram topic `coding-style-dotnet` if any .NET file must be changed.
- Apply the Engram topic `unit-test-rules` if tests are created or modified.
- Preserve frontend maintainability, accessibility, strict TypeScript, cleanup, and performance.
- Do not commit or push.
- Do not use `git reset`, `git restore`, `git checkout --`, or `git clean`.
- Never discard existing user changes.

## Verified initial state

- The only JavaScript package is `C:\Source\materialise\src\LatticeForge.Web`.
- pnpm version available: `10.33.1`.
- The tracked npm lockfile is `src/LatticeForge.Web/package-lock.json`.
- No `pnpm-lock.yaml` exists yet.
- No `pnpm-workspace.yaml` exists.
- No CI workflows currently exist.
- Intentional uncommitted work already exists:
  - moved `BUILD_PROMPTS.md` to `prompts/BUILD_PROMPTS.md`;
  - new `prompts/PNPM_MIGRATION_PROMPT.md`;
  - modified `README.md`;
  - modified `docs/README.md` and `docs/implementation-log.md` links;
  - untracked `scripts/`.
- Preserve and integrate those changes.
- The current frontend suite contains 34 tests.

## Goal

Replace npm with pnpm as the exclusive frontend package manager while preserving dependency versions, application behaviour, tests, scripts, and documentation.

## Architecture decision

This repository has only one JavaScript package. Do not create:

- `pnpm-workspace.yaml`;
- a root `package.json`;
- `.npmrc`;
- new JavaScript packages;
- CI configuration;
- backend package-management abstractions.

The lockfile must remain at `src/LatticeForge.Web/pnpm-lock.yaml`.

## Expected scope

- `src/LatticeForge.Web/package.json`
- Remove `src/LatticeForge.Web/package-lock.json`
- Create `src/LatticeForge.Web/pnpm-lock.yaml`
- `scripts/start-frontend.ps1`
- `README.md`
- `prompts/BUILD_PROMPTS.md`
- `.gitignore`, only if `.pnpm-store/` is missing
- `docs/technical-architecture.md`
- `docs/business-model.md`
- `docs/implementation-log.md`

Do not modify backend source code or manufacturing equations.

## Phase 1 — Inspect and protect state

From the repository root:

1. Run `git status --short`.
2. Confirm the existing README and scripts changes.
3. Run `node --version` and `pnpm --version`.
4. Confirm `package-lock.json` is tracked.
5. Confirm `pnpm-lock.yaml` does not exist.
6. Record these checks before modifying anything.

## Phase 2 — RED

From `src/LatticeForge.Web`, run:

```powershell
pnpm install --frozen-lockfile
```

Expected result: failure because `pnpm-lock.yaml` does not exist. Record the exact failure as Red evidence.

If the command unexpectedly succeeds or modifies the repository, inspect and explain the behaviour before continuing. Do not delete the npm lockfile until a valid pnpm lockfile exists.

## Phase 3 — Package metadata

Update `src/LatticeForge.Web/package.json`:

- Add `"packageManager": "pnpm@10.33.1"`.
- Preserve every dependency and script.
- Do not manually change dependency versions.
- Preserve the existing JSON formatting style.

## Phase 4 — Convert the lockfile

From `src/LatticeForge.Web`:

1. Run `pnpm import`.
2. Confirm `pnpm-lock.yaml` was generated.
3. Confirm it resolves dependencies from the existing `package-lock.json`.
4. Only after successful generation, remove `package-lock.json`.
5. Remove the existing `node_modules` directory to prove a clean pnpm installation.

Windows safety requirements:

- Resolve the absolute `node_modules` path first.
- Confirm it is exactly `C:\Source\materialise\src\LatticeForge.Web\node_modules`.
- Use PowerShell `Remove-Item -LiteralPath ... -Recurse -Force`.
- Never construct a cross-shell deletion command.
- Never delete anything outside the frontend directory.

## Phase 5 — GREEN installation

From `src/LatticeForge.Web`, run:

```powershell
pnpm install --frozen-lockfile
```

Required result:

- Installation succeeds.
- `package-lock.json` is not recreated.
- `pnpm-lock.yaml` is not modified by the frozen installation.
- No unexpected dependency-version changes appear.

## Phase 6 — Update launcher scripts

Update `scripts/start-frontend.ps1`:

- Preserve repository-root resolution.
- Verify `pnpm` exists using `Get-Command`.
- Keep the `package.json` and `node_modules` checks.
- Change missing-dependency guidance to `pnpm install`.
- Start Vite with `pnpm dev --host localhost`.

Do not change `scripts/start-backend.ps1`.

Validate both PowerShell scripts with the PowerShell parser without starting the long-running servers.

## Phase 7 — Update active documentation

Update current instructions from npm to pnpm in:

- `README.md`;
- `docs/technical-architecture.md`;
- `prompts/BUILD_PROMPTS.md`.

Command mappings:

- `npm install` → `pnpm install --frozen-lockfile`
- `npm run dev` → `pnpm dev`
- `npm test` or `npm run test` → `pnpm test`
- `npm run build` → `pnpm build`
- `npm run lint` → `pnpm lint`

Documentation rules:

- Preserve all existing README changes.
- Update future executable prompts in `prompts/BUILD_PROMPTS.md`.
- Do not blindly replace dependency metadata or third-party references.
- Do not rewrite historical npm commands in `docs/implementation-log.md`; they record commands genuinely executed in previous phases.
- Append a migration entry to `docs/implementation-log.md` with scope, Red evidence, lockfile generation, verification results, and changed documentation.
- Add a technical architecture note explaining that pnpm is the frontend package manager, the lockfile is local to the frontend, and no workspace is used because there is one JavaScript package.
- Add a business-model note explicitly stating that this tooling change has no product, pricing, or manufacturing-model impact.
- Keep planned and implemented behaviour separate.

## Phase 8 — Repository hygiene

- Add `.pnpm-store/` to `.gitignore` only if it is not already covered.
- Confirm exactly one active frontend lockfile exists: `src/LatticeForge.Web/pnpm-lock.yaml`.
- Confirm `package-lock.json` is absent.
- Confirm no `pnpm-workspace.yaml` exists.
- Confirm no root `package.json` was created.
- Search for remaining active npm commands while excluding `node_modules`, `dist`, `pnpm-lock.yaml`, and historical entries in `docs/implementation-log.md`.
- Review every remaining match manually. Do not perform a blind global replacement.

## Phase 9 — Full verification

From `src/LatticeForge.Web`:

```powershell
pnpm install --frozen-lockfile
pnpm test
pnpm build
pnpm lint
```

Expected frontend result:

- All existing tests pass; current baseline is 34 tests.
- TypeScript and Vite builds succeed.
- The existing non-blocking large-chunk advisory may remain.
- Existing lint warnings may remain only if they predate this migration.
- No new migration warning is accepted.

From the repository root:

```powershell
dotnet test LatticeForge.sln --no-restore
git diff --check
git status --short
```

Also validate PowerShell script syntax.

## Acceptance criteria

The migration is complete only when:

- `package.json` pins `pnpm@10.33.1`.
- `pnpm-lock.yaml` exists in the frontend directory.
- `package-lock.json` is removed.
- A clean frozen pnpm installation succeeds.
- Tests, build, lint, and .NET tests pass.
- The frontend launcher uses pnpm.
- Current documentation uses pnpm.
- Historical implementation-log evidence remains truthful.
- Existing README and scripts work is preserved.
- No workspace or root JavaScript package was introduced.
- No commit or push was performed.

## Failure rules

- If `pnpm import` fails, stop before deleting `package-lock.json`.
- If dependency resolution changes unexpectedly, investigate instead of accepting it.
- If tests or build fail, fix the migration rather than weakening tests.
- Do not fall back to npm.
- Do not use `--force`.
- Do not suppress peer-dependency or lifecycle-script errors without explaining the root cause.

## Final report

Return:

1. Red evidence.
2. Files created, modified, and removed.
3. pnpm version used.
4. Verification commands and exact results.
5. Dependency-resolution differences.
6. Documentation files updated.
7. Remaining warnings or risks.
8. Confirmation that no commit or push occurred.

Suggest, but do not create, this conventional commit:

`build(web): migrate package management to pnpm`
