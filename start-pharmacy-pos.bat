@echo off
setlocal
cd /d "%~dp0"

echo ========================================
echo       PharmaPOS - Starting System
echo ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed.
  echo Install Node.js 18+ and run this file again.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing required packages for the first run...
  call npm install
  if errorlevel 1 (
    echo Failed to install packages.
    pause
    exit /b 1
  )
)

if not exist .env (
  if exist .env.example (
    copy /Y .env.example .env >nul
    echo Created .env from .env.example
  )
)

echo Starting PharmaPOS...
start "PharmaPOS Browser" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"
node server.js
pause
