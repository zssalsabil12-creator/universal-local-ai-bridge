$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$package = Get-Content (Join-Path $root 'package.json') -Raw | ConvertFrom-Json
$version = [string]$package.version
$releaseDir = Join-Path $root 'release-ulab-desktop-final'
$exe = Join-Path $releaseDir "ULAB-Setup-$version-Windows-x64.exe"
$latest = Join-Path $releaseDir 'latest.yml'

if (-not (Test-Path $exe)) { throw "DESKTOP_APP_NOT_FOUND: $exe" }
if (-not (Test-Path $latest)) { throw "RELEASE_METADATA_NOT_FOUND: $latest" }

$info = Get-Item $exe
if ($info.Length -lt 1MB) { throw 'DESKTOP_APP_TOO_SMALL' }

$sha256 = (Get-FileHash $exe -Algorithm SHA256).Hash
$hex = (Get-FileHash $exe -Algorithm SHA512).Hash
$bytes = for ($i = 0; $i -lt $hex.Length; $i += 2) { [Convert]::ToByte($hex.Substring($i, 2), 16) }
$sha512Base64 = [Convert]::ToBase64String($bytes)
$metadata = Get-Content $latest -Raw

if ($metadata -notmatch [regex]::Escape($sha512Base64)) { throw 'RELEASE_SHA512_MISMATCH' }
if ($metadata -notmatch [regex]::Escape("version: $version")) { throw 'RELEASE_VERSION_MISMATCH' }

$signature = (Get-AuthenticodeSignature $exe).Status
"DESKTOP_APP=PASS"
"VERSION=$version"
"FILE=$($info.FullName)"
"SIZE=$($info.Length)"
"SHA256=$sha256"
"SHA512_BASE64=$sha512Base64"
"METADATA_SHA512=PASS"
"AUTHENTICODE=$signature"
"EXTENSION_PAYLOAD=NOT_APPLICABLE"
