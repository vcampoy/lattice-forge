$ErrorActionPreference = 'Stop'

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$apiProject = Join-Path $repositoryRoot 'src/LatticeForge.Api/LatticeForge.Api.csproj'

if (-not (Test-Path -LiteralPath $apiProject)) {
    throw "API project not found at $apiProject"
}

Write-Host 'Starting Lattice Forge API at http://localhost:5100'
dotnet run --project $apiProject --launch-profile http
