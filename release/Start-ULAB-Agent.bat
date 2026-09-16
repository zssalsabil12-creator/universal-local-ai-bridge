@echo off
setlocal EnableExtensions
set "ROOT=%~dp0"
set "WORKSPACE=%LOCALAPPDATA%\ULAB\workspace"
set "AGENT=%LOCALAPPDATA%\ULAB\ulab-agent.exe"
if not exist "%AGENT%" set "AGENT=%ROOT%ulab-agent.exe"
if not exist "%WORKSPACE%" mkdir "%WORKSPACE%"
if not exist "%AGENT%" (
  echo ULAB Agent is not installed.
  echo Run Install-ULAB.bat first.
  pause
  exit /b 1
)
echo ========================================
echo   ULAB Local Agent V1.0.0
echo ========================================
echo Workspace: %WORKSPACE%
echo Port: 19999
echo.
echo Keep this window open while using ULAB.
echo The persistent local security token is stored in your user profile.
echo.
"%AGENT%" --port 19999 --workspace "%WORKSPACE%"
endlocal
