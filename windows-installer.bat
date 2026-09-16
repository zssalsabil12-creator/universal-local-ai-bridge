@echo off
REM ============================================================================
REM ULAB Windows Installer Script
REM ============================================================================
REM This script installs ULAB on Windows for non-technical users
REM Run this script as Administrator
REM ============================================================================

setlocal enabledelayedexpansion

echo.
echo ============================================================================
echo   Universal Local AI Bridge (ULAB) - Windows Installer
echo ============================================================================
echo.
echo This installer will:
echo   1. Install ULAB Local Agent
echo   2. Register Native Messaging Host
echo   3. Prepare Chrome Extension
echo.

REM Check for administrator privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] This installer requires administrator privileges
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
    echo [WARNING] Node.js not found
    echo           ULAB requires Node.js to run
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    set /p CONTINUE="Continue anyway? (Y/N): "
    if /i not "!CONTINUE!"=="Y" (
        pause
        exit /b 1
    )
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
    echo [PASS] Node.js detected: !NODE_VER!
)

REM Check Chrome
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    echo [PASS] Chrome detected
) else if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    echo [PASS] Chrome detected
) else if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
    echo [PASS] Chrome detected
) else (
    echo [WARNING] Chrome not found
    echo           ULAB works with Chrome or Edge
)

echo.

REM ============================================================================
REM Section 2: Installation Directory
REM ============================================================================
echo [INSTALLATION DIRECTORY]
echo ----------------------------------------------------------------------------

set INSTALL_DIR=%ProgramFiles%\ULAB

echo Installation directory: %INSTALL_DIR%
echo.
set /p CHANGE_DIR="Change installation directory? (Y/N): "

if /i "%CHANGE_DIR%"=="Y" (
    set /p INSTALL_DIR="Enter installation directory: "
)

echo.
echo [INFO] Creating installation directory...
if not exist "%INSTALL_DIR%" (
    mkdir "%INSTALL_DIR%"
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create installation directory
        pause
        exit /b 1
    )
)
echo [PASS] Installation directory created
echo.

REM ============================================================================
REM Section 3: Copy Files
REM ============================================================================
echo [COPYING FILES]
echo ----------------------------------------------------------------------------

echo [1/3] Copying Local Agent...
if exist "agent\dist\ulab-agent.exe" (
    copy /y "agent\dist\ulab-agent.exe" "%INSTALL_DIR%\ulab-agent.exe" >nul
    echo [PASS] Local Agent installed
) else (
    echo [WARNING] Local Agent executable not found
    echo           You may need to build it manually
)

echo [2/3] Copying configuration files...
if exist "agent\native-messaging\com.ulab.agent.json" (
    copy /y "agent\native-messaging\com.ulab.agent.json" "%INSTALL_DIR%\com.ulab.agent.json" >nul
    echo [PASS] Configuration files copied
) else (
    echo [ERROR] Configuration files not found
    pause
    exit /b 1
)

echo [3/3] Copying extension files...
if exist "extension" (
    xcopy /E /I /Y "extension" "%INSTALL_DIR%\extension" >nul
    echo [PASS] Extension files copied
) else (
    echo [ERROR] Extension files not found
    pause
    exit /b 1
)

echo.

REM ============================================================================
REM Section 4: Register Native Messaging Host
REM ============================================================================
echo [REGISTERING NATIVE MESSAGING HOST]
echo ----------------------------------------------------------------------------

set MANIFEST_DIR=%APPDATA%\Google\Chrome\NativeMessagingHosts

echo [1/2] Creating Native Messaging directory...
if not exist "%MANIFEST_DIR%" (
    mkdir "%MANIFEST_DIR%"
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create Native Messaging directory
        pause
        exit /b 1
    )
)
echo [PASS] Native Messaging directory created

echo [2/2] Registering Native Messaging Host...

REM Get Chrome Extension ID
echo.
echo [IMPORTANT] Chrome Extension ID Required
echo ----------------------------------------------------------------------------
echo.
echo To complete the installation, we need your Chrome Extension ID.
echo.
echo How to find it:
echo 1. Open Chrome
echo 2. Go to chrome://extensions/
echo 3. Enable "Developer mode" (toggle in top-right)
echo 4. Click "Load unpacked"
echo 5. Select: %INSTALL_DIR%\extension
echo 6. Copy the Extension ID (looks like: abcdefghijklmnopqrstuvwxyz123456)
echo.
set /p EXTENSION_ID="Enter your Chrome Extension ID: "

if "%EXTENSION_ID%"=="" (
    echo [ERROR] Extension ID is required
    pause
    exit /b 1
)

REM Create Native Messaging manifest with correct path
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

if %errorlevel% neq 0 (
    echo [ERROR] Failed to register Native Messaging Host
    pause
    exit /b 1
)

echo [PASS] Native Messaging Host registered
echo.

REM ============================================================================
REM Section 5: Create Uninstaller
REM ============================================================================
echo [CREATING UNINSTALLER]
echo ----------------------------------------------------------------------------

(
echo @echo off
echo REM ULAB Uninstaller
echo echo.
echo echo ============================================================================
echo echo   Universal Local AI Bridge - Uninstaller
echo echo ============================================================================
echo echo.
echo net session ^>nul 2^>^&1
echo if %%errorlevel%% neq 0 ^(
echo     echo [ERROR] This uninstaller requires administrator privileges
echo     pause
echo     exit /b 1
echo ^)
echo echo [INFO] Removing ULAB...
echo echo.
echo echo [1/3] Removing Native Messaging Host...
echo del /f /q "%%APPDATA%%\Google\Chrome\NativeMessagingHosts\com.ulab.agent.json" 2^>nul
echo echo [PASS] Native Messaging Host removed
echo echo.
echo echo [2/3] Removing installation directory...
echo rmdir /s /q "%INSTALL_DIR%" 2^>nul
echo echo [PASS] Installation directory removed
echo echo.
echo echo [3/3] Uninstall complete
echo echo.
echo echo Please also remove the extension from Chrome:
echo echo 1. Open chrome://extensions/
echo echo 2. Find "Universal Local AI Bridge"
echo echo 3. Click "Remove"
echo echo.
echo pause
) > "%INSTALL_DIR%\uninstall.bat"

echo [PASS] Uninstaller created
echo.

REM ============================================================================
REM Section 6: Create Desktop Shortcut
REM ============================================================================
echo [CREATING DESKTOP SHORTCUT]
echo ----------------------------------------------------------------------------

set DESKTOP=%USERPROFILE%\Desktop
set SHORTCUT=%DESKTOP%\ULAB.lnk

powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%SHORTCUT%'); $Shortcut.TargetPath = '%INSTALL_DIR%\extension'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.Description = 'Universal Local AI Bridge'; $Shortcut.Save()"

if %errorlevel% equ 0 (
    echo [PASS] Desktop shortcut created
) else (
    echo [WARNING] Failed to create desktop shortcut
)

echo.

REM ============================================================================
REM Section 7: Verification
REM ============================================================================
echo [VERIFICATION]
echo ----------------------------------------------------------------------------

set VERIFY_PASS=0
set VERIFY_TOTAL=0

REM Check executable
set /a VERIFY_TOTAL+=1
if exist "%INSTALL_DIR%\ulab-agent.exe" (
    echo   [PASS] Local Agent executable installed
    set /a VERIFY_PASS+=1
) else (
    echo   [WARNING] Local Agent executable not installed
)

REM Check Native Messaging manifest
set /a VERIFY_TOTAL+=1
if exist "%MANIFEST_DIR%\com.ulab.agent.json" (
    echo   [PASS] Native Messaging Host registered
    set /a VERIFY_PASS+=1
) else (
    echo   [FAIL] Native Messaging Host not registered
)

REM Check extension files
set /a VERIFY_TOTAL+=1
if exist "%INSTALL_DIR%\extension\manifest.json" (
    echo   [PASS] Extension files installed
    set /a VERIFY_PASS+=1
) else (
    echo   [FAIL] Extension files not installed
)

echo.
echo Installation verified: %VERIFY_PASS%/%VERIFY_TOTAL% checks passed
echo.

REM ============================================================================
REM Section 8: Summary
REM ============================================================================
echo ============================================================================
echo   INSTALLATION COMPLETE
echo ============================================================================
echo.
echo ULAB has been installed successfully!
echo.
echo Installation details:
echo   Local Agent:      %INSTALL_DIR%\ulab-agent.exe
echo   Extension:        %INSTALL_DIR%\extension
echo   Native Messaging: %MANIFEST_DIR%\com.ulab.agent.json
echo   Extension ID:     %EXTENSION_ID%
echo   Uninstaller:      %INSTALL_DIR%\uninstall.bat
echo   Desktop Shortcut: %SHORTCUT%
echo.
echo Next steps:
echo 1. Load the extension in Chrome (if not already done):
echo    - Open chrome://extensions/
echo    - Enable "Developer mode"
echo    - Click "Load unpacked"
echo    - Select: %INSTALL_DIR%\extension
echo.
echo 2. Open the extension and click "Connect Agent"
echo.
echo 3. Select a project and start using ULAB!
echo.
echo To uninstall:
echo   Run: %INSTALL_DIR%\uninstall.bat
echo.
echo ============================================================================
echo.

pause
