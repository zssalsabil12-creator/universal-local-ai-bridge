@echo off
setlocal EnableExtensions
set "ROOT=%~dp0"
set "INSTALL=%LOCALAPPDATA%\ULAB"

echo ========================================
echo   Universal Local AI Bridge - Installer
echo ========================================
echo.
if not exist "%INSTALL%" mkdir "%INSTALL%"
if errorlevel 1 goto :fail
copy /Y "%ROOT%ulab-agent.exe" "%INSTALL%\ulab-agent.exe" >nul
if errorlevel 1 goto :fail
copy /Y "%ROOT%Start-ULAB-Agent.bat" "%INSTALL%\Start-ULAB-Agent.bat" >nul
if errorlevel 1 goto :fail
if exist "%ROOT%extension" xcopy /E /I /Y "%ROOT%extension" "%INSTALL%\extension" >nul
if errorlevel 1 goto :fail
if not exist "%INSTALL%workspace" mkdir "%INSTALL%\workspace"
echo.
echo Installation complete.
echo Installed to: %INSTALL%
echo.
echo Opening Chrome extension management...
start "" chrome://extensions/
echo.
echo Next: enable Developer mode and choose Load unpacked.
echo Select: %INSTALL%\extension
echo Then run: %INSTALL%\Start-ULAB-Agent.bat
echo.
pause
exit /b 0

:fail
echo.
echo Installation failed. Check the folder permissions and try again.
pause
exit /b 1
