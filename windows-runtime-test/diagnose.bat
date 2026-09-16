@echo off
REM ============================================================================
REM ULAB Windows Runtime Diagnostic Tool
REM ============================================================================
REM This script automatically checks your system for ULAB requirements
REM Run this script by double-clicking it
REM ============================================================================

setlocal enabledelayedexpansion

echo.
echo ============================================================================
echo   Universal Local AI Bridge - Windows Runtime Diagnostic
echo ============================================================================
echo.
echo Date: %date% %time%
echo.

REM Initialize counters
set PASS_COUNT=0
set FAIL_COUNT=0
set WARN_COUNT=0
set BLOCKED_COUNT=0

REM ============================================================================
REM Section 1: System Information
REM ============================================================================
echo [SYSTEM INFORMATION]
echo ----------------------------------------------------------------------------

REM Windows Version
echo.
echo [1/10] Windows Version
ver | findstr /i "Windows" >nul
if %errorlevel% equ 0 (
    echo   [PASS] Windows detected
    ver
    set /a PASS_COUNT+=1
) else (
    echo   [FAIL] Windows not detected
    set /a FAIL_COUNT+=1
)

REM Architecture
echo.
echo [2/10] System Architecture
if "%PROCESSOR_ARCHITECTURE%"=="AMD64" (
    echo   [PASS] 64-bit system detected
    set /a PASS_COUNT+=1
) else if "%PROCESSOR_ARCHITECTURE%"=="x86" (
    echo   [WARNING] 32-bit system detected (64-bit recommended)
    set /a WARN_COUNT+=1
) else (
    echo   [WARNING] Unknown architecture: %PROCESSOR_ARCHITECTURE%
    set /a WARN_COUNT+=1
)

REM ============================================================================
REM Section 2: Node.js and npm
REM ============================================================================
echo.
echo [NODE.JS AND NPM]
echo ----------------------------------------------------------------------------

REM Node.js
echo.
echo [3/10] Node.js
where node >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
    echo   [PASS] Node.js detected: !NODE_VER!
    set /a PASS_COUNT+=1
) else (
    echo   [FAIL] Node.js not found
    echo          Download from: https://nodejs.org/
    set /a FAIL_COUNT+=1
)

REM npm
echo.
echo [4/10] npm
where npm >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VER=%%i
    echo   [PASS] npm detected: !NPM_VER!
    set /a PASS_COUNT+=1
) else (
    echo   [FAIL] npm not found
    echo          npm should be installed with Node.js
    set /a FAIL_COUNT+=1
)

REM ============================================================================
REM Section 3: Browsers
REM ============================================================================
echo.
echo [BROWSERS]
echo ----------------------------------------------------------------------------

REM Chrome
echo.
echo [5/10] Google Chrome
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    echo   [PASS] Chrome detected (Program Files)
    set /a PASS_COUNT+=1
) else if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    echo   [PASS] Chrome detected (Program Files x86)
    set /a PASS_COUNT+=1
) else if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
    echo   [PASS] Chrome detected (Local AppData)
    set /a PASS_COUNT+=1
) else (
    echo   [WARNING] Chrome not found in standard locations
    echo             You may still have Chrome installed elsewhere
    set /a WARN_COUNT+=1
)

REM Edge
echo.
echo [6/10] Microsoft Edge
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    echo   [PASS] Edge detected
    set /a PASS_COUNT+=1
) else if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    echo   [PASS] Edge detected
    set /a PASS_COUNT+=1
) else (
    echo   [WARNING] Edge not found in standard locations
    set /a WARN_COUNT+=1
)

REM ============================================================================
REM Section 4: ULAB Components
REM ============================================================================
echo.
echo [ULAB COMPONENTS]
echo ----------------------------------------------------------------------------

REM Extension folder
echo.
echo [7/10] Extension Package
if exist "extension\manifest.json" (
    echo   [PASS] Extension folder exists
    if exist "extension\background\service-worker.js" (
        echo   [PASS] Service worker present
    ) else (
        echo   [FAIL] Service worker missing
        set /a FAIL_COUNT+=1
    )
    if exist "extension\sidepanel\index.html" (
        echo   [PASS] Side Panel present
    ) else (
        echo   [FAIL] Side Panel missing
        set /a FAIL_COUNT+=1
    )
    if exist "extension\content\content.js" (
        echo   [PASS] Content script present
    ) else (
        echo   [FAIL] Content script missing
        set /a FAIL_COUNT+=1
    )
) else (
    echo   [FAIL] Extension folder not found
    set /a FAIL_COUNT+=1
)

REM Agent
echo.
echo [8/10] Local Agent
if exist "agent\src\index.ts" (
    echo   [PASS] Agent source code present
) else (
    echo   [FAIL] Agent source code missing
    set /a FAIL_COUNT+=1
)

if exist "agent\dist\ulab-agent.exe" (
    echo   [PASS] Agent executable built
) else (
    echo   [WARNING] Agent executable not built
    echo             Run: cd agent ^&^& npm install ^&^& npm run build ^&^& npm run package
    set /a WARN_COUNT+=1
)

REM Native Messaging
echo.
echo [9/10] Native Messaging Configuration
if exist "agent\native-messaging\com.ulab.agent.json" (
    echo   [PASS] Native Messaging manifest present
) else (
    echo   [FAIL] Native Messaging manifest missing
    set /a FAIL_COUNT+=1
)

REM Test Project
echo.
echo [10/10] Test Project
if exist "test-project\package.json" (
    echo   [PASS] Test project present
) else (
    echo   [WARNING] Test project not found
    set /a WARN_COUNT+=1
)

REM ============================================================================
REM Section 5: Summary
REM ============================================================================
echo.
echo ============================================================================
echo   DIAGNOSTIC SUMMARY
echo ============================================================================
echo.
echo   PASSED:   %PASS_COUNT%
echo   FAILED:   %FAIL_COUNT%
echo   WARNINGS: %WARN_COUNT%
echo.

if %FAIL_COUNT% equ 0 (
    echo   [SUCCESS] All critical checks passed!
    echo.
    echo   Next steps:
    echo   1. Run install-agent.bat to install the Local Agent
    echo   2. Load the extension in Chrome/Edge
    echo   3. Run run-tests.bat to execute automated tests
    echo   4. Follow WINDOWS_RUNTIME_GUIDE.md for manual testing
) else (
    echo   [ACTION REQUIRED] Some critical checks failed
    echo.
    echo   Please fix the issues marked [FAIL] above before proceeding
)

echo.
echo ============================================================================
echo.

pause
