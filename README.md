# lattice-forge
A Three.js and ASP.NET Core workspace for parametric 3D design, lattice optimization, and illustrative additive manufacturing analysis.

## Documentation

Start with the [documentation hub](docs/README.md) for the current implementation status, technical architecture, business model, and phase-by-phase delivery evidence.

## Local development

From PowerShell, start the API and frontend in separate terminals:

```powershell
./scripts/start-backend.ps1
./scripts/start-frontend.ps1
```

The API listens on `http://localhost:5100`; Vite serves the frontend at `http://localhost:5173` and proxies `/api` requests to the API.

## Frontend package management

The repository uses pnpm 10.33.1 for its single JavaScript package:

```powershell
cd src/LatticeForge.Web
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm build
pnpm lint
```

The reproducible lockfile is `src/LatticeForge.Web/pnpm-lock.yaml`. No pnpm workspace is used because the repository has only one JavaScript package.
