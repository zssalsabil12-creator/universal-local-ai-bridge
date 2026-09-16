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
