# Dot-source before installation or direct CLI commands: . .\scripts\use-project.ps1
$siteRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$portfolioRoot = [System.IO.Path]::GetFullPath((Join-Path $siteRoot '..'))
$toolCache = Join-Path $portfolioRoot '.tool-cache'
$env:TEMP = Join-Path $toolCache 'tmp'
$env:TMP = $env:TEMP
$env:TMPDIR = $env:TEMP
$env:XDG_CONFIG_HOME = Join-Path $siteRoot '.cache\cloudflare'
$env:XDG_CACHE_HOME = Join-Path $toolCache 'xdg-cache'
$env:WRANGLER_LOG_PATH = Join-Path $env:XDG_CONFIG_HOME 'logs'
$env:WRANGLER_SEND_METRICS = 'false'
$env:ASTRO_TELEMETRY_DISABLED = '1'
$env:PYTHONPYCACHEPREFIX = Join-Path $toolCache 'python-pycache'
$env:PIP_CACHE_DIR = Join-Path $toolCache 'pip'
$projectPythonLibraries = Join-Path $siteRoot '.cache\python-libs'
if ($env:PYTHONPATH) {
    $env:PYTHONPATH = $projectPythonLibraries + [System.IO.Path]::PathSeparator + $env:PYTHONPATH
} else {
    $env:PYTHONPATH = $projectPythonLibraries
}
foreach ($directory in @($env:TEMP, $env:XDG_CONFIG_HOME, $env:XDG_CACHE_HOME, $env:WRANGLER_LOG_PATH, $env:PYTHONPYCACHEPREFIX, $env:PIP_CACHE_DIR)) {
    [System.IO.Directory]::CreateDirectory($directory) | Out-Null
}
$env:pnpm_config_store_dir = Join-Path $portfolioRoot '.pnpm-store'
$env:pnpm_config_cache_dir = Join-Path $toolCache 'pnpm'
$env:pnpm_config_state_dir = Join-Path $toolCache 'pnpm-state'
Set-Location -LiteralPath $siteRoot