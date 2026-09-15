@echo off
setlocal

set "FRONTEND_DIR=%~dp0"
set "SEED_SCRIPT=%FRONTEND_DIR%..\..\database\05_SeedData\002_AssetCategories.sql"

where sqlcmd >nul 2>&1 || (
  echo ERROR: SQL Server sqlcmd is not available on PATH.
  pause
  exit /b 1
)

if not exist "%SEED_SCRIPT%" (
  echo ERROR: Asset category seed script was not found.
  pause
  exit /b 1
)

echo Adding or refreshing development asset categories...
sqlcmd -S localhost -E -No -d JamunaBankProcurement -i "%SEED_SCRIPT%" -b
if errorlevel 1 (
  echo.
  echo ERROR: Categories could not be added. Check SQL Server and Windows database access.
  pause
  exit /b 1
)

echo.
echo Asset categories are ready. Refresh the Asset Configuration page.
pause
endlocal
