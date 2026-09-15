# Jamuna Bank Procurement Web

Frontend foundation for the Central Procurement Requisition Portal.

## Start locally

Double-click `start-local-environment.bat` to start SQL Server, the ASP.NET Core API, and Vite. Run it as Administrator only if the SQL Server service is stopped and Windows requires elevation.

For frontend-only development:

```powershell
npm install
npm run dev
```

The API base URL is configured through `VITE_API_BASE_URL` in `.env.development`.
