@echo off
REM Universal Local AI Bridge - Local Agent Installer for Windows

echo ========================================
echo Universal Local AI Bridge - Local Agent
echo ========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo This installer requires administrator privileges.
    echo Please right-click and select "Run as administrator".
    pause
    exit /b 1
)

echo Installing ULAB Local Agent...
echo.

REM Create installation directory
set INSTALL_DIR=%ProgramFiles%\ULAB
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

REM Copy agent executable
echo Copying agent files...
copy /y dist\ulab-agent.exe "%INSTALL_DIR%\ulab-agent.exe" >nul

REM Get Chrome extension ID (user needs to provide this)
echo.
echo To complete installation, we need your Chrome Extension ID.
echo You can find it by:
echo 1. Open Chrome and go to chrome://extensions/
echo 2. Enable "Developer mode"
echo 3. Load the ULAB extension
echo 4. Copy the Extension ID
echo.
set /p EXTENSION_ID="Enter Chrome Extension ID: "

if "%EXTENSION_ID%"=="" (
    echo Error: Extension ID is required.
    pause
    exit /b 1
)

REM Create native messaging manifest
echo Creating native messaging manifest...
set MANIFEST_DIR=%APPDATA%\Google\Chrome\NativeMessagingHosts
if not exist "%MANIFEST_DIR%" mkdir "%MANIFEST_DIR%"

(
echo {
echo   "name": "com.ulab.agent",
echo   "description": "Universal Local AI Bridge - Local Agent",
echo   "path": "%INSTALL_DIR:\=\\%\\ulab-agent.exe",
echo   "type": "stdio",
echo   "allowed_origins": [
echo     "chrome-extension://%EXTENSION_ID%/"
echo   ]
echo }
) > "%MANIFEST_DIR%\com.ulab.agent.json"

echo.
echo Installation complete!
echo.
echo Next steps:
echo 1. Open Chrome
echo 2. Go to chrome://extensions/
echo 3. Enable "Developer mode"
echo 4. Click "Load unpacked" and select the extension folder
echo 5. Click the ULAB icon to open the side panel
echo 6. Click "Connect Agent" in the side panel
echo.
pause
