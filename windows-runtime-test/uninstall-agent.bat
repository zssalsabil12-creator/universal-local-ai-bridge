@echo off
REM ============================================================================
REM ULAB Local Agent Uninstallation Script
REM ============================================================================
REM This script uninstalls the ULAB Local Agent from Windows
REM Run this script as Administrator
REM ============================================================================

setlocal enabledelayedexpansion

echo.
echo ============================================================================
echo   Universal Local AI Bridge - Local Agent Uninstaller
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

REM Confirm uninstallation
echo [WARNING] This will uninstall the ULAB Local Agent
echo.
set /p CONFIRM="Are you sure you want to continue? (Y/N): "

if /i not "%CONFIRM%"=="Y" (
    echo.
    echo Uninstallation cancelled.
    pause
    exit /b 0
)

echo.

REM ============================================================================
REM Section 1: Remove Agent Files
REM ============================================================================
echo [REMOVING AGENT FILES]
echo ----------------------------------------------------------------------------

set INSTALL_DIR=%ProgramFiles%\ULAB

if exist "%INSTALL_DIR%" (
    echo.
    echo [1/3] Removing installation directory: %INSTALL_DIR%
    rmdir /s /q "%INSTALL_DIR%"
    if %errorlevel% equ 0 (
        echo [PASS] Installation directory removed
    ) else (
        echo [WARNING] Failed to remove installation directory
        echo           You may need to remove it manually
    )
) else (
    echo.
    echo [1/3] Installation directory not found
    echo       [SKIP] Nothing to remove
)

REM ============================================================================
REM Section 2: Remove Native Messaging Configuration
echo.
echo [REMOVING NATIVE MESSAGING CONFIGURATION]
echo ----------------------------------------------------------------------------

set MANIFEST_DIR=%APPDATA%\Google\Chrome\NativeMessagingHosts
set MANIFEST_FILE=%MANIFEST_DIR%\com.ulab.agent.json

if exist "%MANIFEST_FILE%" (
    echo.
    echo [2/3] Removing Native Messaging manifest: %MANIFEST_FILE%
    del /f /q "%MANIFEST_FILE%"
    if %errorlevel% equ 0 (
        echo [PASS] Native Messaging manifest removed
    ) else (
        echo [WARNING] Failed to remove Native Messaging manifest
        echo           You may need to remove it manually
    )
) else (
    echo.
    echo [2/3] Native Messaging manifest not found
    echo       [SKIP] Nothing to remove
)

REM ============================================================================
REM Section 3: Cleanup
echo.
echo [CLEANUP]
echo ----------------------------------------------------------------------------

echo.
echo [3/3] Cleaning up...

REM Remove empty Native Messaging directory if it exists
if exist "%MANIFEST_DIR%" (
    dir "%MANIFEST_DIR%" /b | findstr . >nul
    if %errorlevel% neq 0 (
        rmdir "%MANIFEST_DIR%" 2>nul
        echo [PASS] Empty Native Messaging directory removed
    ) else (
        echo [INFO] Native Messaging directory contains other extensions
    )
)

REM ============================================================================
REM Summary
echo.
echo ============================================================================
echo   UNINSTALLATION COMPLETE
echo ============================================================================
echo.
echo The ULAB Local Agent has been uninstalled successfully.
echo.
echo Removed:
echo   - Agent executable and files
echo   - Native Messaging configuration
echo.
echo Note:
echo   - The extension is still loaded in Chrome/Edge
echo   - To remove it, go to chrome://extensions/ and click "Remove"
echo.
echo ============================================================================
echo.

pause
