$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$release = Join-Path $root 'release'
$work = Join-Path $root '.installer-work'
$out = Join-Path $release 'ULAB-Setup.exe'
$archive = Join-Path $release 'ULAB-v1.0.0-Windows.zip'
if (-not (Test-Path $archive)) { throw "Release archive not found: $archive" }
if (Test-Path $work) { Remove-Item $work -Recurse -Force }
New-Item -ItemType Directory -Path $work | Out-Null
Copy-Item $archive (Join-Path $work 'ULAB-v1.0.0-Windows.zip')
$setup = Join-Path $work 'setup.cmd'
@'
@echo off
setlocal EnableExtensions
set "INSTALL=%LOCALAPPDATA%\ULAB"
set "ARCHIVE=%~dp0ULAB-v1.0.0-Windows.zip"
if not exist "%ARCHIVE%" exit /b 1
if not exist "%INSTALL%" mkdir "%INSTALL%"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$zip=$env:ARCHIVE; $dst=$env:INSTALL; Add-Type -AssemblyName System.IO.Compression.FileSystem; $tmp=Join-Path $env:TEMP ('ULAB-install-' + [guid]::NewGuid()); New-Item -ItemType Directory -Path $tmp | Out-Null; [System.IO.Compression.ZipFile]::ExtractToDirectory($zip,$tmp); Copy-Item (Join-Path $tmp '*') $dst -Recurse -Force; Remove-Item $tmp -Recurse -Force"
if errorlevel 1 exit /b 1
if not exist "%INSTALL%\workspace" mkdir "%INSTALL%\workspace"
>"%INSTALL%\Launch-ULAB.bat" echo @echo off
>>"%INSTALL%\Launch-ULAB.bat" echo start "ULAB Local Agent" "%LOCALAPPDATA%\ULAB\ulab-agent.exe" --port 19999 --workspace "%LOCALAPPDATA%\ULAB\workspace"
>>"%INSTALL%\Launch-ULAB.bat" echo timeout /t 2 /nobreak ^>nul
>>"%INSTALL%\Launch-ULAB.bat" echo start "" "chrome://extensions/"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$w=New-Object -ComObject WScript.Shell; $s=$w.CreateShortcut([Environment]::GetFolderPath('Desktop') + '\ULAB.lnk'); $s.TargetPath=$env:LOCALAPPDATA + '\ULAB\Launch-ULAB.bat'; $s.WorkingDirectory=$env:LOCALAPPDATA + '\ULAB'; $s.Description='Universal Local AI Bridge'; $s.Save()"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$w=New-Object -ComObject WScript.Shell; $dir=Join-Path ([Environment]::GetFolderPath('StartMenu')) 'Programs\ULAB'; New-Item -ItemType Directory -Path $dir -Force | Out-Null; $s=$w.CreateShortcut((Join-Path $dir 'ULAB.lnk')); $s.TargetPath=$env:LOCALAPPDATA + '\ULAB\Launch-ULAB.bat'; $s.WorkingDirectory=$env:LOCALAPPDATA + '\ULAB'; $s.Description='Universal Local AI Bridge'; $s.Save()"
start "" "chrome://extensions/"
exit /b 0
'@ | Set-Content -Path $setup -Encoding ASCII
$sed = Join-Path $work 'ulab-installer.sed'
$workEsc = $work.Replace('\','\\')
$outEsc = $out.Replace('\','\\')
@"
[Version]
Class=IEXPRESS
SEDVersion=3
[Options]
PackagePurpose=InstallApp
ShowInstallProgramWindow=1
HideExtractAnimation=1
UseLongFileName=1
InsideCompressed=1
RebootMode=N
InstallPrompt=
DisplayLicense=
FinishMessage=ULAB installation completed. Chrome extension setup will open next.
TargetName=$out
FriendlyName=Universal Local AI Bridge - Windows Installer
AppLaunched=cmd.exe /c setup.cmd
PostInstallCmd=<None>
AdminQuietInstCmd=
UserQuietInstCmd=
SourceFiles=SourceFiles
[Strings]
InstallPrompt=
DisplayLicense=
FinishMessage=ULAB installation completed. Chrome extension setup will open next.
TargetName=$out
FriendlyName=Universal Local AI Bridge - Windows Installer
AppLaunched=cmd.exe /c setup.cmd
PostInstallCmd=<None>
AdminQuietInstCmd=
UserQuietInstCmd=
FILE0=ULAB-v1.0.0-Windows.zip
FILE1=setup.cmd
[SourceFiles]
SourceFiles0=$workEsc\
[SourceFiles0]
%FILE0%=
%FILE1%=
"@ | Set-Content -Path $sed -Encoding ASCII
& "$env:WINDIR\System32\iexpress.exe" /N $sed
if (-not (Test-Path $out)) { throw "IExpress did not create installer: $out" }
$hash = (Get-FileHash -Algorithm SHA256 $out).Hash
$size = (Get-Item $out).Length
"INSTALLER=$out"
"SIZE=$size"
"SHA256=$hash"
Remove-Item $work -Recurse -Force

