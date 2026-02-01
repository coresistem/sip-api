# 🛠️ Csystem Troubleshooting Knowledge Base (Active)

> **For Agents & Developers**: This is a compact log of active and critical issues. Resolved legacy issues are moved to the [Archive](#resolved-archive).

## 🚑 HIGH PRIORITY / CRITICAL

| ID | Title | Root Cause | Fix |
| :--- | :--- | :--- | :--- |
| **TS-001** | **Login 401 Unauthorized** | Password/Hash mismatch | `npx tsx sync-creds.ts` (Correct password: `c0r3@link001`) |
| **TS-030** | **White Screen (Fatal 500)** | Stale Vite cache / Broken lazy imports | Delete `client/node_modules/.vite` and restart `npm run dev` |
| **TS-034** | **Prisma Client EPERM** | Windows file lock (active process) | Kill all `node.exe` processes and re-run `npx prisma generate` |

---

## 🔍 ACTIVE ISSUES INDEX

| ID | Title | Category | Status |
|---|---|---|---|
| [TS-031](#ts-031) | Git Executable Path Deviation | Environment | Patch Applied |
| [TS-032](#ts-032) | Module Not Found (Relative Paths) | Backend | In-Progress Refactor |
| [TS-033](#ts-033) | Architectural Terminology Violation | Standard | Continuous Audit |
| [TS-035](#ts-035) | Laptop Migration & Sync | Environment | Standardized Workflow |
| [TS-036](#ts-036) | Prisma Schema Mismatch (Seed Fail) | Database | Managed |

---

## 📖 ACTIVE ISSUE DETAILS

### TS-036: Prisma Schema Mismatch (Seed Fail)
- **Symptom**: `npm run db:seed` fails with `Unknown argument 'gender'` or internal Prisma type errors like `CartCreateNestedOneWithoutUserInput`.
- **Root Cause**: `schema.dev.prisma` (SQLite) and `schema.prisma` (PostgreSQL) were out of sync. `seed.ts` used fields/models not present in the dev schema.
- **Solution**: Sync missing fields (`gender`, `dateOfBirth` on `User`) and models (`LabFeature`) into `schema.dev.prisma`, then run `npx prisma generate --schema=prisma/schema.dev.prisma`.

### TS-031: Git Executable Path Deviation
- **Symptom**: 'Restore' tab fails to fetch history.
- **Root Cause**: Git not in system PATH or Node process scope.
- **Solution**: Use absolute path in `git.service.ts` or standardize system PATH.

### TS-032: Module Not Found (Relative Paths)
- **Symptom**: Seed script or server crashes on imports.
- **Root Cause**: Services moved to module-folders but imports still point to `src/services`.
- **Solution**: Update imports to mirror the `server/src/modules/X` structure.

---

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
