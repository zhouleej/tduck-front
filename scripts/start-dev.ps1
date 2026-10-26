$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location -LiteralPath $projectRoot
$previousNodeOptions = $env:NODE_OPTIONS
try {
    if ($env:NODE_OPTIONS -notmatch '(^|\s)--openssl-legacy-provider(\s|$)') {
        $env:NODE_OPTIONS = ($env:NODE_OPTIONS + ' --openssl-legacy-provider').Trim()
    }
    & npm.cmd run dev
    if ($LASTEXITCODE -ne 0) { throw 'Frontend exited with an error.' }
} finally {
    $env:NODE_OPTIONS = $previousNodeOptions
    Pop-Location
}
