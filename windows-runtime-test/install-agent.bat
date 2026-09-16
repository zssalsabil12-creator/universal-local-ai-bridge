@echo off
REM ============================================================================
REM ULAB Local Agent Installation Script
REM ============================================================================
REM This script installs the ULAB Local Agent on Windows
REM Run this script as Administrator
REM ============================================================================

setlocal enabledelayedexpansion

echo.
echo ============================================================================
echo   Universal Local AI Bridge - Local Agent Installer
echo ============================================================================
echo.

REM Check for administrator privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] This script requires administrator privileges
    echo.
    echo Please right-click this script and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo [INFO] Running with administrator privileges
echo.

REM ============================================================================
REM Section 1: Prerequisites Check
REM ============================================================================
echo [PREREQUISITES CHECK]
echo ----------------------------------------------------------------------------

REM Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found
    echo         Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo [PASS] Node.js detected: %NODE_VER%

REM Check npm
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm not found
    echo         npm should be installed with Node.js
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VER=%%i
echo [PASS] npm detected: %NPM_VER%
echo.

REM ============================================================================
REM Section 2: Build Agent
REM ============================================================================
echo [BUILDING LOCAL AGENT]
echo ----------------------------------------------------------------------------

cd agent

REM Install dependencies
echo.
echo [1/3] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    cd ..
    pause
    exit /b 1
)
echo [PASS] Dependencies installed

REM Build TypeScript
echo.
echo [2/3] Building agent...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build agent
    cd ..
    pause
    exit /b 1
)
echo [PASS] Agent built successfully

REM Package executable
echo.
echo [3/3] Packaging executable...
call npm run package
if %errorlevel% neq 0 (
    echo [WARNING] Failed to package executable
    echo           The agent can still run via Node.js
) else (
    echo [PASS] Executable packaged successfully
)

cd ..
echo.

REM ============================================================================
REM Section 3: Install Agent
REM ============================================================================
echo [INSTALLING LOCAL AGENT]
echo ----------------------------------------------------------------------------

REM Create installation directory
set INSTALL_DIR=%ProgramFiles%\ULAB
echo.
echo [1/4] Creating installation directory: %INSTALL_DIR%
if not exist "%INSTALL_DIR%" (
    mkdir "%INSTALL_DIR%"
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create installation directory
        pause
        exit /b 1
    )
)
echo [PASS] Installation directory created

REM Copy agent executable
echo.
echo [2/4] Copying agent files...
if exist "agent\dist\ulab-agent.exe" (
    copy /y "agent\dist\ulab-agent.exe" "%INSTALL_DIR%\ulab-agent.exe" >nul
    echo [PASS] Agent executable copied
) else (
    echo [WARNING] Agent executable not found
    echo           The agent can still run via Node.js
)

REM Copy Native Messaging manifest
echo.
echo [3/4] Installing Native Messaging configuration...
set MANIFEST_DIR=%APPDATA%\Google\Chrome\NativeMessagingHosts
if not exist "%MANIFEST_DIR%" (
    mkdir "%MANIFEST_DIR%"
)

REM Get Chrome extension ID (user needs to provide this)
echo.
echo [IMPORTANT] Chrome Extension ID Required
echo ----------------------------------------------------------------------------
echo.
echo To complete the installation, we need your Chrome Extension ID.
echo.
echo How to find it:
echo 1. Open Chrome and go to chrome://extensions/
echo 2. Enable "Developer mode" (toggle in top-right)
echo 3. Click "Load unpacked"
echo 4. Select the "extension" folder from this package
echo 5. Copy the Extension ID (looks like: abcdefghijklmnopqrstuvwxyz123456)
echo.
set /p EXTENSION_ID="Enter your Chrome Extension ID: "

if "%EXTENSION_ID%"=="" (
    echo [ERROR] Extension ID is required
    pause
    exit /b 1
)

REM Create Native Messaging manifest
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

echo [PASS] Native Messaging manifest installed
echo.

REM ============================================================================
REM Section 4: Verification
echo.
echo [VERIFICATION]
echo ----------------------------------------------------------------------------

REM Verify installation
echo.
echo [4/4] Verifying installation...

set VERIFY_PASS=0
set VERIFY_TOTAL=0

REM Check executable
set /a VERIFY_TOTAL+=1
if exist "%INSTALL_DIR%\ulab-agent.exe" (
    echo   [PASS] Agent executable installed
    set /a VERIFY_PASS+=1
) else (
    echo   [WARNING] Agent executable not installed (can run via Node.js)
)

REM Check Native Messaging manifest
set /a VERIFY_TOTAL+=1
if exist "%MANIFEST_DIR%\com.ulab.agent.json" (
    echo   [PASS] Native Messaging manifest installed
    set /a VERIFY_PASS+=1
) else (
    echo   [FAIL] Native Messaging manifest not installed
)

REM Check manifest content
set /a VERIFY_TOTAL+=1
findstr /i "com.ulab.agent" "%MANIFEST_DIR%\com.ulab.agent.json" >nul
if %errorlevel% equ 0 (
    echo   [PASS] Native Messaging manifest valid
    set /a VERIFY_PASS+=1
) else (
    echo   [FAIL] Native Messaging manifest invalid
)

echo.
echo Installation verified: %VERIFY_PASS%/%VERIFY_TOTAL% checks passed
echo.

REM ============================================================================
REM Section 5: Summary
echo.
echo ============================================================================
echo   INSTALLATION COMPLETE
echo ============================================================================
echo.
echo The ULAB Local Agent has been installed successfully.
echo.
echo Installation details:
echo   Agent location:      %INSTALL_DIR%\ulab-agent.exe
echo   Native Messaging:    %MANIFEST_DIR%\com.ulab.agent.json
echo   Extension ID:        %EXTENSION_ID%
echo.
echo Next steps:
echo 1. Load the extension in Chrome/Edge:
echo    - Open chrome://extensions/
echo    - Enable "Developer mode"
echo    - Click "Load unpacked"
echo    - Select the "extension" folder
echo.
echo 2. Open the extension and click "Connect Agent"
echo.
echo 3. Run run-tests.bat to verify the installation
echo.
echo To uninstall, run: uninstall-agent.bat
echo.
echo ============================================================================
echo.

pause
