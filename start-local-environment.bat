@echo off
setlocal

set "FRONTEND_DIR=%~dp0"
set "API_DIR=%FRONTEND_DIR%..\JamunaBank.Procurement"
set "API_PROJECT=%API_DIR%\src\JamunaBank.Procurement.API\JamunaBank.Procurement.API.csproj"
set "ASSET_DATABASE_SCRIPT=%FRONTEND_DIR%..\..\database\04_StoredProcedures\Asset\001_Asset.sql"
set "ASSET_SPEC_DATABASE_SCRIPT=%FRONTEND_DIR%..\..\database\04_StoredProcedures\Asset\002_AssetSpecifications.sql"
set "ASSET_OFFICER_DATABASE_SCRIPT=%FRONTEND_DIR%..\..\database\04_StoredProcedures\Asset\003_ProcurementOfficerAssetMapping.sql"
set "DIVISION_DATABASE_SCRIPT=%FRONTEND_DIR%..\..\database\04_StoredProcedures\ConcernDivision\002_ConcernDivisionSetup.sql"
set "CONCERN_WORKFLOW_DATABASE_SCRIPT=%FRONTEND_DIR%..\..\database\04_StoredProcedures\ConcernDivision\004_ConcernDivisionIntegration.sql"
set "CONCERN_AUTHORITY_DATABASE_SCRIPT=%FRONTEND_DIR%..\..\database\04_StoredProcedures\ConcernAuthority\003_ConcernAuthorityIntegration.sql"
set "WORKFLOW_DATABASE_SCRIPT=%FRONTEND_DIR%..\..\database\04_StoredProcedures\Workflow\001_WorkflowRule.sql"
set "WORKFLOW_ACTION_DATABASE_SCRIPT=%FRONTEND_DIR%..\..\database\04_StoredProcedures\Workflow\002_WorkflowActions.sql"
set "WORKFLOW_CONFIG_DATABASE_SCRIPT=%FRONTEND_DIR%..\..\database\04_StoredProcedures\Workflow\003_WorkflowRuleConfiguration.sql"
set "WORKFLOW_SAFETY_DATABASE_SCRIPT=%FRONTEND_DIR%..\..\database\04_StoredProcedures\Workflow\004_WorkflowSafety.sql"
set "REQUISITION_TYPES_DATABASE_SCRIPT=%FRONTEND_DIR%..\..\database\02_Constraints\002_EnsureRequisitionTableTypes.sql"
set "REQUISITION_DATABASE_SCRIPT=%FRONTEND_DIR%..\..\database\04_StoredProcedures\Requisition\001_Requisition.sql"
set "REQUISITION_MAKER_DATABASE_SCRIPT=%FRONTEND_DIR%..\..\database\04_StoredProcedures\Requisition\002_RequisitionMaker.sql"
set "REQUISITION_EDIT_DATABASE_SCRIPT=%FRONTEND_DIR%..\..\database\04_StoredProcedures\Requisition\003_RequisitionMakerEditable.sql"
set "MANAGER_DATABASE_SCRIPT=%FRONTEND_DIR%..\..\database\04_StoredProcedures\Manager\002_ManagerWorkflow.sql"
set "MANAGER_FIX_DATABASE_SCRIPT=%FRONTEND_DIR%..\..\database\04_StoredProcedures\Manager\003_ManagerWorkflowIntegrationFix.sql"
set "PROCUREMENT_OFFICER_DATABASE_SCRIPT=%FRONTEND_DIR%..\..\database\04_StoredProcedures\ProcurementOfficer\002_ProcurementOfficerWorkflow.sql"
set "SUPPORTING_DATABASE_SCRIPT=%FRONTEND_DIR%..\..\database\04_StoredProcedures\Common\003_SupportingApis.sql"
set "PROCUREMENT_AUTHORITY_DATABASE_SCRIPT=%FRONTEND_DIR%..\..\database\04_StoredProcedures\ProcurementAuthority\002_ProcurementAuthorityWorkflow.sql"
set "ASSET_CATEGORY_SEED=%FRONTEND_DIR%..\..\database\05_SeedData\002_AssetCategories.sql"
set "PROCUREMENT_AUTHORITY_SEED=%FRONTEND_DIR%..\..\database\05_SeedData\003_ProcurementAuthorityDevelopmentUsers.sql"
set "PROCUREMENT_AUTHORITY_TEST_DATA=%FRONTEND_DIR%..\..\database\05_SeedData\004_ProcurementAuthorityTestRequisitions.sql"
set "CONCERN_AUTHORITY_TEST_DATA=%FRONTEND_DIR%..\..\database\05_SeedData\005_ConcernAuthorityTestRequisitions.sql"
set "PROCUREMENT_TRACKING_API_DATABASE_SCRIPT=%FRONTEND_DIR%..\..\database\04_StoredProcedures\ProcurementTracking\002_ProcurementTrackingApi.sql"
set "PROCUREMENT_TRACKING_LIST_DATABASE_SCRIPT=%FRONTEND_DIR%..\..\database\04_StoredProcedures\ProcurementTracking\003_ProcurementTrackingList.sql"
set "WORK_ORDER_DATABASE_SCRIPT=%FRONTEND_DIR%..\..\database\04_StoredProcedures\WorkOrder\002_WorkOrderApi.sql"
set "SQL_SERVICE=MSSQLSERVER"
set "API_URL=http://localhost:5101"
set "WEB_URL=http://localhost:5173"

echo [1/7] Checking Node, npm, .NET, projects, and SQL Server...
where node >nul 2>&1 || (echo ERROR: Node.js is missing from PATH.& exit /b 1)
where npm >nul 2>&1 || (echo ERROR: npm is missing from PATH.& exit /b 1)
where dotnet >nul 2>&1 || (echo ERROR: .NET SDK is missing from PATH.& exit /b 1)
where sqlcmd >nul 2>&1 || (echo ERROR: SQL Server sqlcmd is missing from PATH.& exit /b 1)
if not exist "%API_PROJECT%" (echo ERROR: API project not found: %API_PROJECT%& exit /b 1)
if not exist "%FRONTEND_DIR%package.json" (echo ERROR: Frontend package.json was not found.& exit /b 1)
sc query "%SQL_SERVICE%" >nul 2>&1 || (echo ERROR: SQL service %SQL_SERVICE% was not found.& exit /b 1)

echo [2/7] Starting SQL Server...
sc query "%SQL_SERVICE%" | find /I "RUNNING" >nul
if errorlevel 1 (
  net start "%SQL_SERVICE%" >nul 2>&1
  if errorlevel 1 (echo ERROR: SQL Server could not start. Run this file as administrator.& exit /b 1)
) else (echo SQL Server is already running.)

echo [3/7] Installing frontend packages when needed...
if not exist "%FRONTEND_DIR%node_modules" call npm --prefix "%FRONTEND_DIR%" install
if errorlevel 1 (echo ERROR: npm install failed.& exit /b 1)

echo [4/7] Applying idempotent Asset and Division Setup stored procedures...
sqlcmd -S localhost -E -C -No -d JamunaBankProcurement -i "%ASSET_DATABASE_SCRIPT%" -b
if errorlevel 1 (echo ERROR: Asset stored procedures could not be applied.& goto :failed)
sqlcmd -S localhost -E -C -No -d JamunaBankProcurement -i "%ASSET_SPEC_DATABASE_SCRIPT%" -b
if errorlevel 1 (echo ERROR: Asset specification stored procedures could not be applied.& goto :failed)
sqlcmd -S localhost -E -C -No -d JamunaBankProcurement -i "%ASSET_OFFICER_DATABASE_SCRIPT%" -b
if errorlevel 1 (echo ERROR: Procurement Officer mapping stored procedures could not be applied.& goto :failed)
sqlcmd -S localhost -E -C -No -d JamunaBankProcurement -i "%DIVISION_DATABASE_SCRIPT%" -b
if errorlevel 1 (echo ERROR: Division Setup stored procedures could not be applied.& goto :failed)
sqlcmd -S localhost -E -C -No -I -d JamunaBankProcurement -i "%CONCERN_WORKFLOW_DATABASE_SCRIPT%" -b
if errorlevel 1 (echo ERROR: Concern Division workflow procedures could not be applied.& goto :failed)
sqlcmd -S localhost -E -C -No -I -d JamunaBankProcurement -i "%CONCERN_AUTHORITY_DATABASE_SCRIPT%" -b
if errorlevel 1 (echo ERROR: Concern Authority integration procedures could not be applied.& goto :failed)
sqlcmd -S localhost -E -C -No -d JamunaBankProcurement -i "%WORKFLOW_DATABASE_SCRIPT%" -b
if errorlevel 1 (echo ERROR: Base workflow rule stored procedures could not be applied.& goto :failed)
sqlcmd -S localhost -E -C -No -d JamunaBankProcurement -i "%WORKFLOW_CONFIG_DATABASE_SCRIPT%" -b
if errorlevel 1 (echo ERROR: Workflow configuration stored procedures could not be applied.& goto :failed)
sqlcmd -S localhost -E -C -No -I -d JamunaBankProcurement -i "%WORKFLOW_ACTION_DATABASE_SCRIPT%" -b
if errorlevel 1 (echo ERROR: Workflow action stored procedures could not be applied.& goto :failed)
sqlcmd -S localhost -E -C -No -I -d JamunaBankProcurement -i "%WORKFLOW_SAFETY_DATABASE_SCRIPT%" -b
if errorlevel 1 (echo ERROR: Workflow safety stored procedures could not be applied.& goto :failed)
sqlcmd -S localhost -E -C -No -d JamunaBankProcurement -i "%REQUISITION_TYPES_DATABASE_SCRIPT%" -b
if errorlevel 1 (echo ERROR: Requisition table types could not be applied.& goto :failed)
sqlcmd -S localhost -E -C -No -I -d JamunaBankProcurement -i "%REQUISITION_DATABASE_SCRIPT%" -b
if errorlevel 1 (echo ERROR: Base requisition stored procedures could not be applied.& goto :failed)
sqlcmd -S localhost -E -C -No -I -d JamunaBankProcurement -i "%REQUISITION_MAKER_DATABASE_SCRIPT%" -b
if errorlevel 1 (echo ERROR: Maker requisition stored procedures could not be applied.& goto :failed)
sqlcmd -S localhost -E -C -No -I -d JamunaBankProcurement -i "%REQUISITION_EDIT_DATABASE_SCRIPT%" -b
if errorlevel 1 (echo ERROR: Maker editable requisition procedure could not be applied.& goto :failed)
sqlcmd -S localhost -E -C -No -I -d JamunaBankProcurement -i "%MANAGER_DATABASE_SCRIPT%" -b
if errorlevel 1 (echo ERROR: Manager workflow procedures could not be applied.& goto :failed)
sqlcmd -S localhost -E -C -No -I -d JamunaBankProcurement -i "%MANAGER_FIX_DATABASE_SCRIPT%" -b
if errorlevel 1 (echo ERROR: Manager workflow integration fix could not be applied.& goto :failed)
sqlcmd -S localhost -E -C -No -I -d JamunaBankProcurement -i "%PROCUREMENT_OFFICER_DATABASE_SCRIPT%" -b
if errorlevel 1 (echo ERROR: Procurement Officer workflow procedures could not be applied.& goto :failed)
sqlcmd -S localhost -E -C -No -I -d JamunaBankProcurement -i "%SUPPORTING_DATABASE_SCRIPT%" -b
if errorlevel 1 (echo ERROR: Supporting history procedures could not be applied.& goto :failed)
sqlcmd -S localhost -E -C -No -I -d JamunaBankProcurement -i "%PROCUREMENT_AUTHORITY_DATABASE_SCRIPT%" -b
if errorlevel 1 (echo ERROR: Procurement Authority workflow procedures could not be applied.& goto :failed)
sqlcmd -S localhost -E -C -No -I -d JamunaBankProcurement -i "%PROCUREMENT_AUTHORITY_SEED%" -b
if errorlevel 1 (echo ERROR: Development Procurement Authority users could not be seeded.& goto :failed)
sqlcmd -S localhost -E -C -No -I -d JamunaBankProcurement -i "%PROCUREMENT_AUTHORITY_TEST_DATA%" -b
if errorlevel 1 (echo ERROR: Development Procurement Authority test requisitions could not be seeded.& goto :failed)
sqlcmd -S localhost -E -C -No -I -d JamunaBankProcurement -i "%CONCERN_AUTHORITY_TEST_DATA%" -b
if errorlevel 1 (echo ERROR: Development Concern Authority test requisitions could not be seeded.& goto :failed)
sqlcmd -S localhost -E -C -No -I -d JamunaBankProcurement -i "%PROCUREMENT_TRACKING_API_DATABASE_SCRIPT%" -b
if errorlevel 1 (echo ERROR: Procurement Tracking API procedures could not be applied.& goto :failed)
sqlcmd -S localhost -E -C -No -I -d JamunaBankProcurement -i "%PROCUREMENT_TRACKING_LIST_DATABASE_SCRIPT%" -b
if errorlevel 1 (echo ERROR: Procurement Tracking list procedure could not be applied.& goto :failed)
sqlcmd -S localhost -E -C -No -I -d JamunaBankProcurement -i "%WORK_ORDER_DATABASE_SCRIPT%" -b
if errorlevel 1 (echo ERROR: Work Order procedures could not be applied.& goto :failed)
sqlcmd -S localhost -E -C -No -d JamunaBankProcurement -i "%ASSET_CATEGORY_SEED%" -b
if errorlevel 1 (echo ERROR: Development asset categories could not be seeded.& goto :failed)

echo [5/7] Stopping previous local API/frontend listeners...
taskkill /FI "WINDOWTITLE eq JamunaBank Procurement API*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq JamunaBank Procurement Web*" /T /F >nul 2>&1

echo [6/7] Building the API...
dotnet build "%API_PROJECT%" --no-restore --configuration Debug --nologo -p:NoWarn=NU1900
if errorlevel 1 (echo ERROR: API build failed.& goto :failed)

echo [7/7] Starting API and frontend in separate windows...
start "JamunaBank Procurement API" cmd /k "cd /d "%API_DIR%" && set ASPNETCORE_ENVIRONMENT=Development && dotnet run --no-build --project "%API_PROJECT%" --launch-profile http"
start "JamunaBank Procurement Web" cmd /k "cd /d "%FRONTEND_DIR%" && npm run dev -- --host 127.0.0.1"

echo Waiting for services...
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$deadline=(Get-Date).AddSeconds(45); $api=$false; $web=$false; do { try { $r=Invoke-RestMethod '%API_URL%/api/system/database-health' -TimeoutSec 2; $api=[bool]$r.success } catch {}; try { $w=Invoke-WebRequest '%WEB_URL%' -UseBasicParsing -TimeoutSec 2; $web=$w.StatusCode -eq 200 } catch {}; if($api -and $web){break}; Start-Sleep -Milliseconds 750 } while((Get-Date) -lt $deadline); if(-not $api){Write-Warning 'API/database health check is not ready; inspect the API window.'}; if(-not $web){Write-Warning 'Frontend is not ready; inspect the frontend window.'}; if($api -and $web){Write-Host 'READY: database, API, and frontend are running.'; exit 0}; exit 1"

echo.
echo Frontend: %WEB_URL%
echo API:      %API_URL%
echo Swagger:  %API_URL%/swagger
echo Press Ctrl+C in each service window to stop that service.
endlocal
exit /b 0

:failed
echo.
echo Startup failed. Review the error shown above.
pause
endlocal
exit /b 1
