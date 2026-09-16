@echo off
setlocal
set "INSTALL=%LOCALAPPDATA%\ULAB"
set "ARCHIVE=%~dp0ULAB-v1.0.0-Windows.zip"
if not exist "%INSTALL%" mkdir "%INSTALL%"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$z=$env:ARCHIVE; $d=$env:INSTALL; Add-Type -AssemblyName System.IO.Compression.FileSystem; $t=Join-Path $env:TEMP ('ulab-' + [guid]::NewGuid()); New-Item -ItemType Directory $t|Out-Null; [IO.Compression.ZipFile]::ExtractToDirectory($z,$t); Copy-Item (Join-Path $t '*') $d -Recurse -Force; Remove-Item $t -Recurse -Force"
if errorlevel 1 exit /b 1
if not exist "%INSTALL%\workspace" mkdir "%INSTALL%\workspace"
>"%INSTALL%\Launch-ULAB.bat" echo @echo off
>>"%INSTALL%\Launch-ULAB.bat" echo start "ULAB Local Agent" "%LOCALAPPDATA%\ULAB\ulab-agent.exe" --port 19999 --workspace "%LOCALAPPDATA%\ULAB\workspace"
>>"%INSTALL%\Launch-ULAB.bat" echo timeout /t 2 /nobreak ^>nul
>>"%INSTALL%\Launch-ULAB.bat" echo start "" "chrome://extensions/"
start "" "chrome://extensions/"
exit /b 0
