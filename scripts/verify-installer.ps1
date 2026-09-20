$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$exe = Join-Path $root 'public\downloads\ULAB.exe'
if (-not (Test-Path $exe)) { throw "DESKTOP_APP_NOT_FOUND: $exe" }
$info = Get-Item $exe
if ($info.Length -lt 1MB) { throw 'DESKTOP_APP_TOO_SMALL' }
$hash = Get-FileHash $exe -Algorithm SHA256
"DESKTOP_APP=PASS"
"FILE=$($info.FullName)"
"SIZE=$($info.Length)"
"SHA256=$($hash.Hash)"
"EXTENSION_PAYLOAD=NOT_APPLICABLE"
