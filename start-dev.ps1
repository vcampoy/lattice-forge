[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

function Resolve-RequiredPath {
    param(
        [Parameter(Mandatory)]
        [string]$Path,

        [Parameter(Mandatory)]
        [string]$Description
    )

    $resolved = Resolve-Path -LiteralPath $Path -ErrorAction SilentlyContinue
    if ($null -eq $resolved) {
        throw "$Description not found at '$Path'."
    }

    return $resolved.Path
}

function Stop-ProcessTree {
    param([Parameter(Mandatory)][int]$ProcessId)

    $children = @(Get-CimInstance -ClassName Win32_Process -Filter "ParentProcessId = $ProcessId" -ErrorAction SilentlyContinue)
    foreach ($child in $children) {
        Stop-ProcessTree -ProcessId ([int]$child.ProcessId)
    }

    if (Get-Process -Id $ProcessId -ErrorAction SilentlyContinue) {
        Stop-Process -Id $ProcessId -Force -ErrorAction SilentlyContinue
    }
}

$repositoryRoot = Resolve-RequiredPath -Path $PSScriptRoot -Description 'Repository root'
$apiProject = Resolve-RequiredPath -Path (Join-Path $repositoryRoot 'src/LatticeForge.Api/LatticeForge.Api.csproj') -Description 'API project'
$webRoot = Resolve-RequiredPath -Path (Join-Path $repositoryRoot 'src/LatticeForge.Web') -Description 'Frontend root'
$null = Resolve-RequiredPath -Path (Join-Path $webRoot 'package.json') -Description 'Frontend package'
$webModules = Resolve-RequiredPath -Path (Join-Path $webRoot 'node_modules') -Description 'Frontend dependencies'

$dotnetCommand = Get-Command dotnet -CommandType Application -ErrorAction Stop | Select-Object -First 1
$dotnet = $dotnetCommand.Source
$pnpmCommand = Get-Command pnpm.cmd -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
if ($null -eq $pnpmCommand) {
    $pnpmCommand = Get-Command pnpm -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
}
if ($null -eq $pnpmCommand) {
    throw 'pnpm is required. Install pnpm 10.33.1 first.'
}
$pnpm = $pnpmCommand.Source

$logRoot = Join-Path ([System.IO.Path]::GetTempPath()) 'lattice-forge'
New-Item -ItemType Directory -Path $logRoot -Force | Out-Null
$runId = Get-Date -Format 'yyyyMMdd-HHmmss'
$apiOutput = Join-Path $logRoot "api-$runId.out.log"
$apiError = Join-Path $logRoot "api-$runId.err.log"
$webOutput = Join-Path $logRoot "web-$runId.out.log"
$webError = Join-Path $logRoot "web-$runId.err.log"

$apiProcess = $null
$webProcess = $null

try {
    $apiProcess = Start-Process -FilePath $dotnet `
        -ArgumentList @('run', '--project', $apiProject, '--launch-profile', 'http') `
        -WorkingDirectory $repositoryRoot `
        -RedirectStandardOutput $apiOutput `
        -RedirectStandardError $apiError `
        -WindowStyle Hidden `
        -PassThru

    $webProcess = Start-Process -FilePath $pnpm `
        -ArgumentList @('dev', '--host', 'localhost') `
        -WorkingDirectory $webRoot `
        -RedirectStandardOutput $webOutput `
        -RedirectStandardError $webError `
        -WindowStyle Hidden `
        -PassThru

    Write-Host 'Lattice Forge development servers started.'
    Write-Host 'Web: http://localhost:5173'
    Write-Host 'API: http://localhost:5100'
    Write-Host "Logs: $logRoot"
    Write-Host 'Press Ctrl+C to stop both servers.'

    while ($true) {
        if ($apiProcess.HasExited -or $webProcess.HasExited) {
            throw 'A development server exited. Check the log files for details.'
        }

        Start-Sleep -Seconds 1
    }
}
finally {
    if ($null -ne $webProcess) {
        Stop-ProcessTree -ProcessId $webProcess.Id
    }

    if ($null -ne $apiProcess) {
        Stop-ProcessTree -ProcessId $apiProcess.Id
    }
}
