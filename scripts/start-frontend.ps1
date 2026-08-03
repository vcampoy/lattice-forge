$ErrorActionPreference = 'Stop'

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$webRoot = Join-Path $repositoryRoot 'src/LatticeForge.Web'

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    throw "pnpm is required to start the frontend. Install pnpm 10.33.1 first."
}

if (-not (Test-Path -LiteralPath (Join-Path $webRoot 'package.json'))) {
    throw "Frontend package not found at $webRoot"
}

if (-not (Test-Path -LiteralPath (Join-Path $webRoot 'node_modules'))) {
    throw "Frontend dependencies are missing. Run 'pnpm install' in $webRoot first."
}

Push-Location $webRoot
try {
    Write-Host 'Starting Lattice Forge frontend at http://localhost:5173'
    pnpm dev --host localhost
}
finally {
    Pop-Location
}
