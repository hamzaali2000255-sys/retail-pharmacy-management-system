@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo ========================================
echo      PharmaPOS - Windows Setup
 echo ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js 18+ is required.
  echo Install Node.js, then run this installer again.
  pause
  exit /b 1
)

if not exist .env if exist .env.example copy /Y .env.example .env >nul

echo Installing Node.js dependencies...
call npm install
if errorlevel 1 (
  echo ERROR: npm install failed.
  pause
  exit /b 1
)

echo.
echo Setup complete.
echo.
echo IMPORTANT: Import database\schema.sql into MySQL/XAMPP phpMyAdmin once.
echo Then double-click start-pharmacy-pos.bat whenever you want to run PharmaPOS.
echo.
pause
