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
| [TS-037](#ts-037) | Production White Screen (Circular Deps) | Frontend | Critical |
| [TS-038](#ts-038) | Server Build Fails on Scripts | Build | High |
| [TS-039](#ts-039) | Prisma Provider Mismatch (Prod) | Deployment | Critical |
| [TS-040](#ts-040) | PDF Layout Discrepancy (@react-pdf/renderer) | UI/PDF | Medium |
| [TS-041](#ts-041) | Profile Save 400 (Validation Regex) | API/Runtime | High |
| [TS-042](#ts-042) | Data Disappears After Save (State Out of Sync) | Architecture | Medium |
| [TS-043](#ts-043) | Duplicate Sidebar Keys (React Warning) | Frontend | Low |
| [TS-044](#ts-044) | API 500 on Layout Config (Prisma Sync) | Backend | Medium |
| [TS-045](#ts-045) | Profile Fetch 500 (Field Ghost Migration) | Database | High |
| [TS-046](#ts-046) | Deep Link Param Loss (Route Redirection) | Frontend | High |
| [TS-047](#ts-047) | Registration Null Constraint (Prisma 7 vs 5 Sync) | Database | Critical |
| [TS-048](#ts-048) | Production Login Persistent 401 (Seeder Sync) | Auth | High |
| [TS-049](#ts-049) | Code Changes Ignored (Stale Server Process) | Environment | High |


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

## TS-037: Production White Screen (Circular Deps)

| **Category** | **Severity** | **Effort** |
| :--- | :--- | :--- |
| Frontend | Critical | Low |

### Symptoms
Deployed site shows a white screen. Console error: `Uncaught TypeError: Cannot read properties of undefined (reading 'useState')`.

### Root Cause
Aggressive `manualChunks` in `vite.config.ts` forces React into a separate bucket from libraries that need it immediately, causing circular dependencies or race conditions in chunk loading order.

### Debug Steps
1. Check browser console in production.
2. Verify if `vendor.js` loads before `vendor-react.js`.

### Solution
Remove the `manualChunks` configuration in `client/vite.config.ts` and let Vite handle chunk splitting automatically.

### Related Files
client/vite.config.ts

## TS-038: Server Build Fails on Scripts

| **Category** | **Severity** | **Effort** |
| :--- | :--- | :--- |
| Build | High | Low |

### Symptoms
`npm run build` (tsc) fails on the server with strict type errors in `server/scripts/*.ts`.

### Root Cause
`tsconfig.json` included the `scripts/` folder, which contains ad-hoc maintenance scripts that are not maintained to production strictness standards.

### Solution
Update `server/tsconfig.json` to **exclude** the `scripts` folder from the build process.

### Related Files
server/tsconfig.json

## TS-039: Prisma Provider Mismatch (Prod)

| **Category** | **Severity** | **Effort** |
| :--- | :--- | :--- |
| Deployment | Critical | Low |

### Symptoms
Deployment fails with `Error: Error validating datasource db: the URL must start with the protocol file:`.

### Root Cause
Production `prisma/schema.prisma` is configured with `provider = "sqlite"` but the environment variable `DATABASE_URL` is a PostgreSQL connection string.

### Solution
Change `provider` to `"postgresql"` in `prisma/schema.prisma` (and ensure dev environment uses `schema.dev.prisma` which stays as sqlite).

### Related Files
server/prisma/schema.prisma

## TS-040: PDF Layout Discrepancy (@react-pdf/renderer)

| **Category** | **Severity** | **Effort** |
| :--- | :--- | :--- |
| UI/PDF | Medium | Medium |

### Symptoms
On-screen preview shows side-by-side layout (e.g., for Pasal 3), but the downloaded PDF displays sections vertically/stacked.

### Root Cause
1. **Data Structure Mismatch**: The UI uses responsive grids (`grid-cols-2`), while the PDF engine needs a forced Flexbox structure (`flexDirection: 'row'`).
2. **Component Desync**: PDF generation logic in multiple files (e.g., `LegalPanelPage` and `DataProcessAgreementPage`) using different hardcoded data versions.
3. **Caching**: Browser aggressively caches old JS/PDF chunks, making changes seem ineffective.

### Debug Steps
1. Verify `pasals` data structure includes `subsections` to facilitate column splitting.
2. Check if the PDF component uses `flexDirection: 'row'` on the container and fixed widths (e.g., `48%`) for children.
3. Add a visible version watermark (e.g., "v2.2 Force") to confirm the latest code is running.

### Solution
Sync all PDF trigger points to use a unified structure (e.g., `AgreementPDFv2`) and ensure the data passed to the component includes explicit `subsections`. Force layout in PDF using:
```javascript
{ flexDirection: 'row', justifyContent: 'space-between' }
```
And for children:
```javascript
{ width: '48%' }
```

### Related Files
- client/src/modules/admin/components/AgreementPDFv2.tsx
- client/src/modules/admin/pages/DataProcessAgreementPage.tsx
- client/src/modules/admin/pages/LegalPanelPage.tsx

## TS-041: Profile Save 400 (Validation Regex)

| **Category** | **Severity** | **Effort** |
| :--- | :--- | :--- |
| API/Runtime | High | Low |

### Symptoms
Saving profile returns `400 Bad Request`. Payload shows correct data, but backend rejects it. Common with Phone/WhatsApp fields.

### Root Cause
Frontend sends empty strings `""` for optional fields like `phone`. Backend validator (`express-validator`) fails regex check because `""` does not match the required pattern (e.g., `^(\+62|0)[0-9]+$`), even if marked `.optional()` (because optional only ignores `undefined` or `null`, not empty strings).

### Solution
1. **Frontend**: Sanitize payload before sending. Convert empty strings to `undefined`.
2. **Backend**: Update `express-validator` to use `{ values: 'falsy' }` in `.optional()`. This allows `""`, `0`, or `false` to be treated as "empty" rather than invalid values.
```typescript
body('phone').optional({ values: 'falsy' }).trim().matches(...)
```

### Related Files
- `client/.../MasterProfileSection.tsx`
- `server/.../profile.routes.ts`

## TS-042: Data Disappears After Save (State Out of Sync)

| **Category** | **Severity** | **Effort** |
| :--- | :--- | :--- |
| Architecture | Medium | Low |

### Symptoms
User saves data successfully, switches tab/navigates away, comes back, and the form is empty/reset to old data.

### Root Cause
Backend Mutation Endpoint (`update`) returns a **PARTIAL** object (e.g., only `{ id, updatedAt }`) to save bandwidth. Frontend Global State updates its cache with this partial object, wiping out existing fields like `name` or `email` from the local cache.

### Solution
1. **Backend**: Ensure Backend ALWAYS returns the full entity object (via Prisma `select`) after any update.
2. **Frontend**: In `ProfilePage.tsx`, do NOT rely solely on `user` from `useAuth` (which is static). Use the live `profile` object from the `useProfile` hook.
```typescript
const { profile } = useProfile();
const displayUser = profile?.user || user; // Prioritize live data
```

### Related Files
- `server/.../profile.controller.ts`
- `client/.../ProfilePage.tsx`

## TS-043: Duplicate Sidebar Keys (React Warning)

| **Category** | **Severity** | **Effort** |
| :--- | :--- | :--- |
| Frontend | Low | Low |

### Symptoms
Console Warning: `Encountered two children with the same key, /club/approvals`.

### Root Cause
Super Admin role renders ALL sidebar groups. If a module path is shared across multiple role groups (or duplicated in config logic), `DashboardLayout` renders it multiple times with the same key (path).

### Solution
Deduplicate navigation items by path before rendering in `DashboardLayout.tsx`.
```typescript
.filter((item, index, self) => index === self.findIndex((t) => t.path === item.path))
```

### Related Files
- `client/.../DashboardLayout.tsx`

## TS-044: API 500 on Layout Config (Prisma Sync)

| **Category** | **Severity** | **Effort** |
| :--- | :--- | :--- |
| Backend | Medium | Low |

### Symptoms
`GET /api/v1/layout/super_admin` returns 500 Internal Server Error.

### Root Cause
Model `UILayoutConfig` exists in `schema.prisma` but `PrismaClient` hasn't been regenerated (`npx prisma generate`), OR the table doesn't exist in DB (`npx prisma db push`). Accessing `prisma.uILayoutConfig` fails at runtime.

### Solution
1. **Short-term:** Add safety check `if (!prisma.uILayoutConfig) return null;` in controller.
2. **Permanent:** Restart dev server and run `npx prisma db push && npx prisma generate`.

### Related Files
- `server/.../layout.controller.ts`

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

## TS-045: Profile Fetch 500 (Field Ghost Migration)

| **Category** | **Severity** | **Effort** |
| :--- | :--- | :--- |
| Database | High | Medium |

### Symptoms
`GET /api/v1/profile` returns 500 Internal Server Error. Profile page shows a loading spinner indefinitely or says "Failed to load profile".

### Root Cause
`schema.dev.prisma` (SQLite) is out of sync with the logic. For example, `Athlete` model still has mandatory fields (like `dateOfBirth` or `gender`) that were moved to the `User` model but not removed/made optional in the local Dev schema. Prisma crashes when trying to select fields that don't exist in the DB or failing validation.

### Debug Steps
1. Run a test script with Prisma to isolate the query.
2. Check `error.code` (e.g., `P2022`: Column does not exist).
3. Compare `schema.prisma` vs `schema.dev.prisma`.

### Solution
1. Remove defunct/deprecated fields from `prisma/schema.dev.prisma`.
2. Run `npx prisma generate --schema=prisma/schema.dev.prisma`.
3. Force a sync if needed: `npx prisma db push --schema=prisma/schema.dev.prisma --accept-data-loss`.

### Related Files
- `server/prisma/schema.dev.prisma`
- `server/src/modules/core/profile/profile.controller.ts`

## TS-046: Deep Link Param Loss (Route Redirection)

| **Category** | **Severity** | **Effort** |
| :--- | :--- | :--- |
| Frontend | High | Medium |

### Symptoms
Opening a deep link (e.g., Parent Registration from WhatsApp) shows the Landing/Greeting page briefly (flash) or permanently, instead of jumping directly to the Signup form with pre-filled data. Query parameters like `?role=PARENT` appear to be ignored.

### Root Cause
1. **The "Silent Robber" (Router Redirection)**: The application used a path (e.g., `/onboarding`) that wasn't explicitly registered in `App.tsx`. React Router's catch-all `*` route redirected unknown paths to `/`, but the `<Navigate />` component stripped all search parameters during the redirect.
2. **State Initializer Delay**: State for `step` and `formData` was being calculated in `useEffect` (after the first render). This caused a "flash" of the default greeting state before the logic could detect the URL params.

### Debug Steps
1. **Trace the URL Journey**: Watch the browser address bar during load. If `host/onboarding?role=X` quickly changes to `host/` without parameters, the Router is redirecting.
2. **First Render Audit**: Add `console.log` to the top of the component to see the `window.location.search` during the very first execution of the function.

### Solution
1. **Explicit Route Registration**: Add all used paths (including aliases like `/onboarding`) to `App.tsx` so the Router accepts them without redirection.
2. **State Initializer Logic**: Move URL parameter parsing directly into the `useState` initializer callback. This ensures the component starts in the correct state (e.g., `signup` step) on the **first render**.
   ```typescript
   const [step, setStep] = useState(() => {
       const params = new URLSearchParams(window.location.search);
       return params.get('role') ? 'signup' : 'greeting';
   });
   ```
3. **Redirection Guard**: Update the `useEffect` that handles dashboard redirects for logged-in users to ignore cases where "Deep Link" parameters (`role`, `childId`, etc.) are present.

### Related Files
- `client/src/App.tsx` (Route registration)
- `client/src/modules/core/pages/OnboardingPage.tsx` (State logic)
- `client/src/modules/core/components/profile/AthleteProfileSection.tsx` (Link generation)

## TS-047: Registration Null Constraint (Prisma 7 vs 5 Sync)

| **Category** | **Severity** | **Effort** |
| :--- | :--- | :--- |
| Database | Critical | Medium |

### Symptoms
Registration fails with `Null constraint violation on the fields: ('archery_category')` even if the code was updated to treat the field as optional.

### Root Cause
1. **Prisma Version Conflict**: The system was built for Prisma 5, but running `npx prisma` on a newer machine triggered **Prisma 7**'s CLI. Prisma 7 has breaking changes (removing `url` in `schema.prisma`) causing some `db push` or `generate` commands to fail or produce inconsistent artifacts.
2. **State Mismatch**: The TypeScript code (Prisma Client) and the actual DB schema were out of sync because the migration/push tool was using a different engine than the runtime.

### Debug Steps
1. Create a script (e.g., `check-db.ts`) to query `PRAGMA table_info(athletes)` directly via raw SQL.
2. Observe if `NotNull` matches the expectations in `schema.dev.prisma`.

### Solution
1. **Force Versioning**: Explicitly call the legacy version: `npx -y prisma@5.22.0 ...`.
2. **Nuke & Sync**:
   - Kill all `node.exe` processes.
   - Delete `dev.db` and the `.prisma` cache in `node_modules`.
   - Run `npx -y prisma@5.22.0 db push --accept-data-loss` followed by `generate`.
3. **Core Identity First**: Ensure domain-specific fields (like `archeryCategory`) are marked optional (`String?`) in ALL schema files to support lean registration.

### Related Files
- `server/prisma/schema.prisma`
- `server/prisma/schema.dev.prisma`
- `server/src/modules/core/auth/auth.controller.ts`

## TS-048: Production Login Persistent 401 (Seeder Sync)

| **Category** | **Severity** | **Effort** |
| :--- | :--- | :--- |
| Authentication | High | Medium |

### Symptoms
User receives "Invalid email or password" (401) on the live production site (Render) even ketika mengunakan kredensial Blueprint (`admin@sip.id`), sementara di Local Dev berhasil.

### Root Cause
1. **Empty Production DB**: DB di Render awalnya kosong.
2. **Seeder Delay**: Seeder otomatis mungkin belum selesai atau crash saat auto-restart di Render.
3. **JWT Secret**: Environment variable `JWT_SECRET` di Render harus sinkron.

### Debug Steps
1. Cek Render Logs untuk log `✅ Database seeding completed!`.
2. Verifikasi `DATABASE_URL` dan `JWT_SECRET`.

### Solution (In Progress)
- Seeder otomatis diintegrasikan ke `Start Command`.
- **PR**: Debug lanjutan kenapa login tetap gagal meskipun seeder aktif.

### Related Files
- `server/package.json`
- `server/prisma/seed.ts`
- `server/src/modules/core/auth/auth.controller.ts`

## TS-049: Code Changes Ignored (Stale Server Process)

| **Category** | **Severity** | **Effort** |
| :--- | :--- | :--- |
| Environment | High | Quick |

### Symptoms
Code changes (especially in controllers or routes) are saved correctly, but the API response on the client remains old/unchanged. Logs don't show up. It feels like you're chasing a "ghost" in the machine.

### Root Cause
A stale Node.js process is holding port **5000** (or your server port) in the background. It may have failed to hot-reload or crashed partially but kept the port open. New server instances fail to bind to the port (EADDRINUSE), causing you to communicate with the "zombie" version of the server.

### Debug Steps
1. Run `netstat -ano | findstr :5000` to find the PID.
2. Check `npm run dev` logs for `EADDRINUSE` errors usually hidden at the start.
3. Add a unique timestamp log (e.g., `Date.now()`) to a response and verify if it changes on the client.

### Solution
Kill all stale Node processes to force a clean binding:
```powershell
# Windows
taskkill /F /IM node.exe
# Linux/Mac
killall -9 node
```
Then restart both server and client.

### Prevention
Always check for `EADDRINUSE` warnings during server startup.

### Related Files
N/A (System Level)
