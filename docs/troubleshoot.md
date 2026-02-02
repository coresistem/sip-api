# 🛠️ System Troubleshooting Knowledge Base (Active)

> **For Agents & Developers**: This file is synced to the database. Please follow the format below for new entries.

## 🚑 HIGH PRIORITY / CRITICAL

| ID | Title | Root Cause | Fix |
| :--- | :--- | :--- | :--- |
| **TS-001** | **Login 401 Unauthorized** | Password/Hash mismatch | `npx tsx sync-creds.ts` (Correct password: `c0r3@link001`) |
| **TS-030** | **White Screen (Fatal 500)** | Stale Vite cache / Broken lazy imports | Delete `client/node_modules/.vite` and restart `npm run dev` |
| **TS-034** | **Prisma Client EPERM** | Windows file lock (active process) | Kill all `node.exe` processes and re-run `npx prisma generate` |

## 🔍 ACTIVE ISSUES INDEX

| ID | Title | Category | Severity |
|---|---|---|---|
| [TS-031](#ts-031) | Git Executable Path Deviation | Environment | Low |
| [TS-032](#ts-032) | Module Not Found (Relative Paths) | Backend | Medium |
| [TS-033](#ts-033) | Architectural Terminology Violation | Standard | Low |
| [TS-035](#ts-035) | Laptop Migration & Sync | Environment | Medium |
| [TS-036](#ts-036) | Prisma Schema Mismatch (Seed Fail) | Database | Medium |

---

## 📖 ACTIVE ISSUE DETAILS

## TS-001: Login 401 Unauthorized

| **Category** | **Severity** | **Effort** |
| :--- | :--- | :--- |
| Authentication | Critical | Quick |

### Symptoms
User cannot login, receives 401 Unauthorized errors despite correct credentials.

### Root Cause
Password hashing mismatch or seed data inconsistency.

### Debug Steps
1. Verify hashed password in database.
2. Check `sync-creds.ts` output.

### Solution
Run `npx tsx sync-creds.ts` (Correct password: `c0r3@link001`).

### Prevention
Automated seed verification on startup.

### Related Files
server/scripts/sync-creds.ts

## TS-030: White Screen (Fatal 500)

| **Category** | **Severity** | **Effort** |
| :--- | :--- | :--- |
| UI | Critical | Quick |

### Symptoms
Application loads a white screen. Console shows 500 errors or connection refused.

### Root Cause
Stale Vite cache or broken lazy imports.

### Debug Steps
1. Check browser console.
2. Check network tab for failed chunks.

### Solution
Delete `client/node_modules/.vite` and restart `npm run dev`.

### Prevention
N/A

### Related Files
client/vite.config.ts

## TS-034: Prisma Client EPERM

| **Category** | **Severity** | **Effort** |
| :--- | :--- | :--- |
| Database | High | Quick |

### Symptoms
Prisma generation fails with EPERM error.

### Root Cause
Windows file lock on the generated client by an active Node process.

### Debug Steps
1. Try running generate command.
2. Observe error code.

### Solution
Kill all `node.exe` processes and re-run `npx prisma generate`.

### Prevention
Don't run generate while server is hot-reloading aggressively.

### Related Files
prisma/schema.prisma

## TS-036: Prisma Schema Mismatch (Seed Fail)

| **Category** | **Severity** | **Effort** |
| :--- | :--- | :--- |
| Database | Medium | Medium |

### Symptoms
`npm run db:seed` fails with `Unknown argument 'gender'` or internal Prisma type errors like `CartCreateNestedOneWithoutUserInput`.

### Root Cause
`schema.dev.prisma` (SQLite) and `schema.prisma` (PostgreSQL) were out of sync. `seed.ts` used fields/models not present in the dev schema.

### Debug Steps
1. Compare schemas/prisma vs prisma/schema.dev.prisma.
2. Run diff.

### Solution
Sync missing fields (`gender`, `dateOfBirth` on `User`) and models (`LabFeature`) into `schema.dev.prisma`, then run `npx prisma generate --schema=prisma/schema.dev.prisma`.

### Prevention
Use a schema sync tool or single source of truth.

### Related Files
prisma/seed.ts

## TS-031: Git Executable Path Deviation

| **Category** | **Severity** | **Effort** |
| :--- | :--- | :--- |
| Environment | Low | Quick |

### Symptoms
'Restore' tab fails to fetch history.

### Root Cause
Git not in system PATH or Node process scope.

### Debug Steps
1. Check `git --version` in terminal.
2. Check `process.env.PATH` in node.

### Solution
Use absolute path in `git.service.ts` or standardize system PATH.

### Prevention
Standard dev container.

### Related Files
server/src/modules/core/system/git.service.ts

## TS-032: Module Not Found (Relative Paths)

| **Category** | **Severity** | **Effort** |
| :--- | :--- | :--- |
| Backend | Medium | Medium |

### Symptoms
Seed script or server crashes on imports.

### Root Cause
Services moved to module-folders but imports still point to `src/services`.

### Debug Steps
1. Check import paths in failed files.

### Solution
Update imports to mirror the `server/src/modules/X` structure.

### Prevention
Use aliased imports (@modules/...).

### Related Files
server/src/index.ts

## TS-033: Architectural Terminology Violation

| **Category** | **Severity** | **Effort** |
| :--- | :--- | :--- |
| Standard | Low | Long |

### Symptoms
Codebase uses inconsistent naming (e.g., 'Controller' vs 'Handler').

### Root Cause
Legacy code mixed with new architecture.

### Debug Steps
Audit codebase.

### Solution
Continuous audit and refactoring.

### Prevention
Strict linting rules.

### Related Files
Whole codebase

## TS-035: Laptop Migration & Sync

| **Category** | **Severity** | **Effort** |
| :--- | :--- | :--- |
| Environment | Medium | Long |

### Symptoms
New dev environment missing config or dependencies.

### Root Cause
Environment drift.

### Debug Steps
Check .env files.

### Solution
Standardized Workflow and setup scripts.

### Prevention
Dockerize environment.

### Related Files
README.md

## 🗄️ RESOLVED ARCHIVE

<details>
<summary>Click to view resolved issues (TS-002 to TS-029)</summary>

- **TS-003**: EADDRINUSE Port 5000 -> Kill PID using port.
- **TS-004**: Avatar Upload 500 -> Fix Vite proxy port.
- **TS-008**: CORS Blocked in Prod -> Add domain to `allowedOrigins`.
- **TS-024**: Live Avatar 404 -> Migrated to Supabase Storage.
- **TS-029**: Vite WebSocket Failed -> Kill zombie Node processes.

*(Full details preserved in legacy logs if needed)*
</details>
