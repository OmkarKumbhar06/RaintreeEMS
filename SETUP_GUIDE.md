# Raintree EMS — Complete Setup Guide

## Project Structure
```
RaintreeEMS/
├── Database/
│   └── 01_CreateDatabase.sql          ← Run this FIRST in SSMS
├── Backend/                           ← ASP.NET Core Web API (.NET 8)
│   ├── Controllers/                   ← Auth, Departments, Employees, Reports, Dashboard
│   ├── Services/                      ← BUSINESS LOGIC layer (validation, orchestration)
│   ├── Repositories/                  ← DATA ACCESS layer (Stored Procedure calls)
│   ├── Interfaces/
│   │   ├── Services/                  ← IAuthService, IEmployeeService, etc.
│   │   └── Repositories/              ← IUserRepository, IEmployeeRepository, etc.
│   ├── Models/                        ← Domain entities (User, Department, Employee)
│   ├── DTOs/                          ← Request/Response DTOs
│   ├── Data/DatabaseContext.cs        ← SqlConnection factory (Singleton)
│   ├── Helpers/JwtHelper.cs           ← JWT generation
│   ├── Program.cs                     ← App bootstrap, DI, JWT, CORS, Swagger
│   ├── appsettings.json               ← ⚙️  Edit connection string here
│   └── RaintreeEMS.csproj
└── Frontend/                          ← Angular 20 SPA (standalone components)
    ├── src/app/
    │   ├── core/
    │   │   ├── services/              ← auth, department, employee, report, dashboard
    │   │   ├── guards/auth.guard.ts   ← Route protection
    │   │   └── interceptors/          ← JWT Bearer token attachment
    │   ├── features/
    │   │   ├── auth/login.component.ts
    │   │   ├── dashboard/
    │   │   ├── departments/
    │   │   ├── employees/
    │   │   └── reports/
    │   ├── shared/
    │   │   ├── components/layout.component.ts   ← Sidebar + router outlet
    │   │   └── models/models.ts
    │   ├── app.ts                     ← Root component
    │   ├── app.config.ts              ← Providers: router, http, interceptor
    │   └── app.routes.ts              ← Lazy-loaded routes
    ├── src/index.html                 ← Loads Font Awesome from CDN
    ├── src/styles.css                 ← Global design system
    ├── angular.json
    ├── package.json
    └── tsconfig.json
```

---

## Backend Architecture (Repository + Service Pattern)

```
Controller  ->  Service (business logic)  ->  Repository (data access)  ->  Stored Procedure  ->  SQL Server
```

| Layer | Responsibility | Example |
|-------|----------------|---------|
| **Controller** | HTTP routing, `[Authorize]` checks, status codes | `EmployeesController` |
| **Service** | Validation, business rules, response shaping (`ApiResponse<T>`) | `EmployeeService` checks duplicate codes, required fields |
| **Repository** | Pure data access via `SqlCommand` + stored procedures, no business rules | `EmployeeRepository` calls `sp_CreateEmployee`, `sp_GetAllEmployees` |
| **DatabaseContext** | Singleton factory that creates `SqlConnection` instances | `Data/DatabaseContext.cs` |

Why this separation matters: repositories can be unit-tested by mocking interfaces like `IEmployeeRepository`; services can be tested independently of the database; swapping data access (e.g. to Dapper or EF Core) only touches the Repository layer; and business rules such as "employee code must be unique" or "can't delete a department with employees" live in one place, the Service layer.

---

## Prerequisites

| Tool          | Min Version | Install |
|---------------|-------------|---------|
| .NET SDK      | 8.0         | https://dotnet.microsoft.com/download/dotnet/8.0 |
| SQL Server    | 2019+       | https://www.microsoft.com/sql-server/sql-server-downloads |
| SSMS          | 18+         | https://aka.ms/ssms |
| Node.js       | 18 LTS      | https://nodejs.org |
| Angular CLI   | 20.x        | `npm install -g @angular/cli@20` |

---

## Step 1 — Database Setup

1. Open **SQL Server Management Studio**
2. Connect to your SQL Server (e.g. `localhost` or `.\SQLEXPRESS`)
3. Open `Database/01_CreateDatabase.sql`
4. Press **F5** to run

This creates:
- Database **RaintreeEMS**
- Tables: `Users`, `Departments`, `Employees`
- **12 Stored Procedures** covering all CRUD, reports, and dashboard
- Sample data: 6 departments, 10 employees

---

## Step 2 — Backend Setup

### 2a. Edit the connection string

Open `Backend/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=RaintreeEMS;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

Common variants:
- **SQL Server Express:** `Server=.\\SQLEXPRESS;Database=RaintreeEMS;Trusted_Connection=True;TrustServerCertificate=True;`
- **SQL Auth:** `Server=localhost;Database=RaintreeEMS;User Id=sa;Password=YourPwd;TrustServerCertificate=True;`

### 2b. Run the API

```bash
cd RaintreeEMS/Backend
dotnet restore
dotnet run
```

- API base URL: **http://localhost:5000**
- Swagger UI:   **http://localhost:5000/swagger**

---

## Step 3 — Create Users (Important!)

The seed script inserts placeholder BCrypt hashes. Use Swagger or Postman to register real users:

**POST http://localhost:5000/api/auth/register**
```json
{ "fullName": "Administrator", "email": "admin@raintree.com", "password": "Admin@123", "role": "Admin" }
```
```json
{ "fullName": "Regular User",  "email": "user@raintree.com",  "password": "User@123",  "role": "User"  }
```

Then clean up the placeholder rows in SSMS:
```sql
USE RaintreeEMS;
DELETE FROM Users WHERE PasswordHash LIKE '$2a$11$92IXU%';
```

---

## Step 4 — Frontend Setup

```bash
cd RaintreeEMS/Frontend

# Install packages (first time only — ~1–2 mins)
npm install

# Start dev server
ng serve
# or: npm start
```

Open **http://localhost:4200** in your browser.

---

## API Reference

### Authentication (No token required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login`    | Login → JWT token |

### Departments (Token required; write operations: Admin only)
| Method | Endpoint | Auth |
|--------|----------|------|
| GET    | `/api/departments`     | Any  |
| GET    | `/api/departments/{id}`| Any  |
| POST   | `/api/departments`     | Admin|
| PUT    | `/api/departments/{id}`| Admin|
| DELETE | `/api/departments/{id}`| Admin|

### Employees (same pattern as Departments)
`/api/employees` — GET/POST/PUT/{id}/DELETE/{id}

### Reports & Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/employee-by-department` | Dept-grouped report |
| GET | `/api/dashboard/stats`                | Summary counts      |
| GET | `/api/dashboard/employees/{status}`   | Drill-down list     |

---

## Feature Summary

| Module | What it does |
|--------|-------------|
| **Login** | JWT auth, password toggle, demo credentials shown |
| **Layout** | Fixed sidebar, user info, role badge, logout |
| **Dashboard** | 4 stat cards — click any to drill down into employee list |
| **Departments** | List, Add, Edit, Delete (Admin) — modal form, search |
| **Employees** | Full CRUD (Admin), dept dropdown (active only), search |
| **Reports** | Department-wise grouped table, search filter, CSV export |
| **Route Guard** | All pages behind `authGuard` — redirects to /login |
| **Interceptor** | Automatically attaches `Authorization: Bearer {token}` |
| **Role-based** | Admin: full CRUD · User: read-only |

---

## Troubleshooting

**`dotnet: command not found`** → Install .NET 8 SDK and restart terminal.

**SQL connection fails** → Verify SQL Server is running in Windows Services. Test connection in SSMS first.

**Angular CLI not found** → `npm install -g @angular/cli@20`

**`ng serve` CORS error** → Ensure API is running on port 5000. Check `Program.cs` → `WithOrigins("http://localhost:4200")`.

**Login says "Cannot connect to server"** → API must be running before the Angular app can authenticate.

**npm install peer dependency errors** → `npm install --legacy-peer-deps`
