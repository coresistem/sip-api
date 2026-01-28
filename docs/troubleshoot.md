# Troubleshooting Knowledge Base

> **For Agents & Developers**: Use this document to quickly diagnose and fix known issues. When you encounter a new bug, add an entry here.

---

### **SIP System Status (Jan 25, 2026)**

| Component | Category | Functional? | Detailed Issues / Observations |
| :--- | :--- | :--- | :--- |
| **Backend API** | Core | ✅ Yes | **Fixed**: Restored all 36+ routes. Previous `500 Internal Server Errors` on sidebar and categories are resolved. |
| **Auth - Login** | Authentication | ✅ Yes | Primary login flow is operational. JWT tokens and cookie handling are stable. |
| **Auth - Logout** | Authentication | ✅ Yes | **Fixed**: Resolved the "Logout Loop" where the app redirected to a missing `/onboarding` route. Now redirects to `/login`. |
| **Role Sync** | Permissions | ✅ Yes | **Fixed**: Added `localStorage` clearing to ensure role changes (e.g., promotion to Supplier) take effect without manual cache clearing. |
| **Database (Local)** | Storage | ✅ Yes | **Fixed**: Synced SQLite (`dev.db`) with `schema.dev.prisma`. Added missing `MarketplaceCategory` model. |
| **Supplier Dashboard**| Feature | ✅ Yes | **Restored**: UI components recovered from backup. Permissions verified for `SUPPLIER` role. |
| **My Shop / Catalog** | Feature | ✅ Yes | **Restored**: Product listing table and filters are fully functional. |
| **Add Product Flow** | Feature | ⚠️ Partial | **Linked**: Component restored and service methods (`createCategory`, etc.) added. Needs final verification of the physical image upload endpoint. |
| **Sidebar Config** | Navigation | ✅ Yes | **Fixed**: Role-based group fetching from DB is working. Missing `sidebar` routes were re-registered. |
| **Image Cropper** | Utility | ✅ Yes | **Fixed**: Created `ImageCropModal.tsx` placeholder to resolve "Module Not Found" build errors. Imports standardized to `@/` alias. |
| **WebSockets** | Real-time | ❌ No | **Active Issue**: Console shows `WebSocket connection failed`. See [TS-029](#ts-029-vite-websockethmr-connection-failed). |

---

## Index

| ID | Title | Category | Severity | Effort |
|---|---|---|---|---|
| [TS-001](#ts-001-login-401-unauthorized) | Login 401 Unauthorized | Authentication | High | Quick |
| [TS-002](#ts-002-prisma-client-eperm-error) | Prisma Client EPERM Error | Database | Medium | Medium |
| [TS-003](#ts-003-eaddrinuse-port-5000) | EADDRINUSE Port 5000 | Backend | Medium | Quick |
| [TS-004](#ts-004-avatar-upload-500-error) | Avatar Upload 500 Error | API | High | Quick |
| [TS-005](#ts-005-file-manager-blinking) | File Manager Blinking | UI | Medium | Medium |
| [TS-006](#ts-006-sidebar-module-not-appearing) | Sidebar Module Not Appearing | UI | Medium | Quick |
| [TS-007](#ts-007-club-panel-access-denied) | Club Panel Access Denied | Authentication | Medium | Quick |
| [TS-008](#ts-008-cors-blocked-origin-in-production) | CORS Blocked Origin in Production | Deployment | High | Quick |
| [TS-009](#ts-009-vercel-404-on-refresh) | Vercel 404 on Refresh | Deployment | High | Quick |
| [TS-010](#ts-010-typescript-config-for-production-build) | TypeScript Config for Production Build | Build | High | Medium |
| [TS-011](#ts-011-pwa-maskable-icon-issues) | PWA Maskable Icon Issues | UI | Low | Quick |
| [TS-012](#ts-012-onboarding-data-not-persisting) | Onboarding Data Not Persisting | API | High | Medium |
| [TS-013](#ts-013-view-as-auto-navigation-issue) | View As Auto-Navigation Issue | UI | Medium | Medium |
| [TS-014](#ts-014-coach-score-submission-blocked) | Coach Score Submission Blocked | API | High | Quick |
| [TS-015](#ts-015-multi-role-system-import-errors) | Multi-Role System Import Errors | Build | Medium | Quick |
| [TS-016](#ts-016-profile-controller-duplicate-identifier) | Profile Controller Duplicate Identifier | Backend | High | Quick |
| [TS-017](#ts-017-prisma-upsert-missing-required-field) | Prisma Upsert Missing Required Field | Database | High | Medium |
| [TS-018](#ts-018-shell-redirection-file-corruption) | Shell Redirection File Corruption | Build | Critical | Long |
| [TS-019](#ts-019-agent-password-reset-deviation) | Agent Password Reset Deviation | Process | Medium | Quick |
| [TS-020](#ts-020-input-field-icon-overlay) | Input Field Icon Overlay | UI | Low | Quick |
| [TS-021](#ts-021-localhost-sidebar-missing-modules) | Localhost Sidebar Missing Modules | UI | Low | Quick |
| [TS-022](#ts-022-browser-verification-429-errors) | Browser Verification 429 Errors | Tooling | Low | Quick |
| [TS-023](#ts-023-live-avatar-upload-mixed-content--404) | Live Avatar Upload Mixed Content / 404 | Deployment/API | High | Quick |
| [TS-024](#ts-024-live-avatar-uploads-404-ephemeral-storage) | Live Avatar Uploads 404 (Ephemeral Storage) | Deployment | High | High |
| [TS-025](#ts-025-troubleshooting-sync-failure-localhost) | Troubleshooting Sync Failure (Localhost) | Backend | Medium | Quick |
| [TS-026](#ts-026-postgresql-migration-failure-datetime-syntax) | PostgreSQL Migration Failure (DATETIME Syntax) | Database | High | Quick |
| [TS-027](#ts-027-migration-conflict-relation-already-exists) | Migration Conflict (Relation Already Exists) | Database | High | Quick |
| [TS-028](#ts-028-database-reset--restore-point) | Database Reset & Restore Point | Database | Medium | Medium |
| [TS-029](#ts-029-vite-websockethmr-connection-failed) | Vite WebSocket/HMR Connection Failed | UI/Dev | Low | Quick |
| [TS-030](#ts-030-white-screen-fatal-500-after-module-refactor) | White Screen After Module Refactor | Frontend / Build | Critical | Medium |
| [TS-031](#ts-031-git-executable-path-deviation) | Git Executable Path Deviation | Environment / System | High | Low |
| [TS-032](#ts-032-module-not-found-relative-paths) | Module Not Found (Relative Paths) | Backend | High | Quick |
| [TS-033](#ts-033-architectural-terminology-violation) | Architectural Terminology Violation | Standard | Low | Quick |

---

## TS-001: Login 401 Unauthorized

| Field | Value |
|---|---|
| **Category** | Authentication |
| **Severity** | High |
| **Effort** | Quick (<15m) |
| **Date** | 2026-01-20 |

### Symptoms
- User enters correct credentials but receives 401 Unauthorized.
- Server logs show `POST /api/v1/auth/login` requests reaching the server.
- Multiple login attempts all fail.

### Root Cause
Password hash mismatch in the database. The stored `passwordHash` does not match the password being entered, likely due to:
- Manual database edits without proper hashing.
- Password reset in a different environment.
- Database migration issues.

### Debug Steps
1. Check server logs for `POST /api/v1/auth/login` requests.
2. Run `scripts/check-admin.ts` to verify user exists and is active.
3. If user exists, the password hash is likely incorrect.

### Solution
Run the password reset script:
```bash
cd server
npx tsx scripts/reset-admin-password.ts
```

### Prevention
- Always use `bcrypt.hash()` when setting passwords programmatically.
- Never manually edit `passwordHash` in the database.

### Related Files
- `server/src/controllers/auth.controller.ts`
- `server/scripts/reset-admin-password.ts`
- `server/scripts/check-admin.ts`

---

## TS-002: Prisma Client EPERM Error

| Field | Value |
|---|---|
| **Category** | Database |
| **Severity** | Medium |
| **Effort** | Medium (15m-1h) |
| **Date** | 2026-01-19 |

### Symptoms
- `EPERM: operation not permitted` error when running `npm run db:generate:local`.
- Prisma Client files are locked.

### Root Cause
The server process (`npx tsx watch`) is holding a lock on Prisma Client files, preventing regeneration.

### Debug Steps
1. Check for running server processes: `netstat -ano | findstr :5000`
2. Identify the PID of the server process.

### Solution
1. Stop all server processes (Ctrl+C in server terminal).
2. Run `npm run db:generate:local`.
3. Restart the server.

See: `server/README_PRISMA.md`

### Prevention
- Always stop the server before regenerating Prisma Client.
- Use the documented workflow in `README_PRISMA.md`.

### Related Files
- `server/prisma/schema.dev.prisma`
- `server/README_PRISMA.md`

---

## TS-003: EADDRINUSE Port 5000

| Field | Value |
|---|---|
| **Category** | Backend |
| **Severity** | Medium |
| **Effort** | Quick (<15m) |
| **Date** | 2026-01-19 |

### Symptoms
- Server fails to start with `EADDRINUSE: address already in use :::5000`.

### Root Cause
Another process is already using port 5000 (often a zombie Node process or another server instance).

### Debug Steps
```bash
netstat -ano | findstr :5000
```
Identify the PID using port 5000.

### Solution
Kill the offending process:
```bash
taskkill /PID <PID> /F
```
Then restart the server.

### Prevention
- Use `Ctrl+C` to properly stop servers instead of closing terminals.
- Check for running processes before starting servers.

### Related Files
- `server/src/index.ts`

---

## TS-004: Avatar Upload 500 Error

| Field | Value |
|---|---|
| **Category** | API |
| **Severity** | High |
| **Effort** | Quick (<15m) |
| **Date** | 2026-01-15 |

### Symptoms
- Profile picture upload fails with a 500 Internal Server Error.
- Console shows CORS or proxy errors.

### Root Cause
Vite proxy in `client/vite.config.ts` is pointing to the wrong backend port.

### Debug Steps
1. Check `client/vite.config.ts` for proxy target.
2. Verify backend is running on the expected port (e.g., 5000 or 3000).
3. Check server logs for the actual listening port.

### Solution
Ensure `vite.config.ts` proxy matches the server port:
```typescript
server: {
  proxy: {
    '/api': 'http://localhost:5000', // or 3000
  }
}
```

### Prevention
- Standardize backend port in `.env` and `vite.config.ts`.

### Related Files
- `client/vite.config.ts`
- `server/src/index.ts`

---

## TS-005: File Manager Blinking

| Field | Value |
|---|---|
| **Category** | UI |
| **Severity** | Medium |
| **Effort** | Medium (15m-1h) |
| **Date** | 2026-01-15 |

### Symptoms
- File Manager modal appears briefly then disappears repeatedly.
- Content flickers when modal is open.

### Root Cause
Body scroll lock was not properly managed, causing re-renders and state conflicts.

### Solution
Implemented body scroll lock using `useEffect`:
```typescript
useEffect(() => {
  document.body.style.overflow = 'hidden';
  return () => { document.body.style.overflow = ''; };
}, []);
```

### Prevention
- Always manage body scroll lock when rendering modals.
- Use React Portal for modal rendering.

### Related Files
- `client/src/components/documents/FileManager.tsx`

---

## TS-006: Sidebar Module Not Appearing

| Field | Value |
|---|---|
| **Category** | UI |
| **Severity** | Medium |
| **Effort** | Quick (<15m) |
| **Date** | 2026-01-12 |

### Symptoms
- New module added to permissions but does not appear in sidebar.

### Root Cause
Module was added to `permissions.ts` but not to `NAV_ITEMS` in `DashboardLayout.tsx`.

### Debug Steps
1. Check `client/src/types/permissions.ts` for module definition.
2. Check `client/src/components/layout/DashboardLayout.tsx` for `NAV_ITEMS` entry.
3. Check if module has correct `roles` array.

### Solution
Add the module to both files:
```typescript
// permissions.ts - MODULE_METADATA
my_module: { label: 'My Module', roles: ['SUPER_ADMIN', ...] }

// DashboardLayout.tsx - NAV_ITEMS
{ path: '/my-module', icon: MyIcon, label: 'My Module', module: 'my_module' }
```

### Prevention
- Always update both `permissions.ts` AND `DashboardLayout.tsx` when adding modules.
- Invalidate permissions cache by updating the version key in `PermissionsContext.tsx`.

### Related Files
- `client/src/types/permissions.ts`
- `client/src/components/layout/DashboardLayout.tsx`
- `client/src/context/PermissionsContext.tsx`

---

## TS-007: Club Panel Access Denied

| Field | Value |
|---|---|
| **Category** | Authentication |
| **Severity** | Medium |
| **Effort** | Quick (<15m) |
| **Date** | 2026-01-19 |

### Symptoms
- Super Admin cannot access `/club/permissions` route.
- Redirected to dashboard or shown access denied.

### Root Cause
`ClubRoute` wrapper in `App.tsx` did not include `SUPER_ADMIN` in allowed roles.

### Solution
Add `SUPER_ADMIN` to the role check:
```typescript
// App.tsx - ClubRoute
if (user?.role !== 'CLUB' && user?.role !== 'CLUB_OWNER' && user?.role !== 'SUPER_ADMIN') {
  return <Navigate to="/" />;
}
```

### Prevention
- When creating role-restricted routes, always consider if Super Admin should have access.

### Related Files
- `client/src/App.tsx`

---

## TS-008: CORS Blocked Origin in Production

| Field | Value |
|---|---|
| **Category** | Deployment |
| **Severity** | High |
| **Effort** | Quick (<15m) |
| **Date** | 2026-01-05 |

### Symptoms
- API requests from `app.corelink.id` fail with CORS errors.
- Browser console shows `Access-Control-Allow-Origin` errors.

### Root Cause
Production domain was not included in the CORS `allowedOrigins` array in `server/src/index.ts`.

### Solution
Add the production domain to allowed origins:
```typescript
const allowedOrigins = [
    'http://localhost:5173',
    'https://app.corelink.id',
    process.env.CORS_ORIGIN,
].filter(Boolean);
```

### Prevention
- Always update CORS configuration when deploying to new domains.

### Related Files
- `server/src/index.ts`

---

## TS-009: Vercel 404 on Refresh

| Field | Value |
|---|---|
| **Category** | Deployment |
| **Severity** | High |
| **Effort** | Quick (<15m) |
| **Date** | 2026-01-05 |

### Symptoms
- SPA pages return 404 when refreshed or accessed directly.
- Works on first load but fails on browser refresh.

### Root Cause
Vercel does not know to route all requests to `index.html` for client-side routing.

### Solution
Create `vercel.json` in client root:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Prevention
- Always include `vercel.json` rewrites for SPAs deployed to Vercel.

### Related Files
- `client/vercel.json`

---

## TS-010: TypeScript Config for Production Build

| Field | Value |
|---|---|
| **Category** | Build |
| **Severity** | High |
| **Effort** | Medium (15m-1h) |
| **Date** | 2026-01-05 |

### Symptoms
- Build fails on Vercel/deployment with TypeScript errors.
- Local build works but production build fails.

### Root Cause
Mismatched `tsconfig.json` settings between development and production. CommonJS vs ESM module resolution issues.

### Debug Steps
1. Run `npm run build` locally to replicate.
2. Check error messages for specific TS errors.

### Solution
Ensure consistent `tsconfig.json` settings:
```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "skipLibCheck": true
  }
}
```

### Prevention
- Test production builds locally before deploying.
- Use `skipLibCheck: true` to avoid library type conflicts.

### Related Files
- `client/tsconfig.json`
- `server/tsconfig.json`

---

## TS-011: PWA Maskable Icon Issues

| Field | Value |
|---|---|
| **Category** | UI |
| **Severity** | Low |
| **Effort** | Quick (<15m) |
| **Date** | 2026-01-10 |

### Symptoms
- PWA install shows cropped or misaligned app icon.
- Icon appears too large on home screen.

### Root Cause
Maskable icons require more padding (safe zone) than regular icons.

### Solution
Create maskable icon with 40% padding around the central logo:
- Use a 512x512 canvas with logo at ~300x300 centered.
- Add `"purpose": "maskable"` to the icon entry in `manifest.json`.

### Prevention
- Always test PWA icons with Chrome DevTools Application tab.

### Related Files
- `client/public/manifest.json`
- `client/public/icons/`

---

## TS-012: Onboarding Data Not Persisting

| Field | Value |
|---|---|
| **Category** | API |
| **Severity** | High |
| **Effort** | Medium (15m-1h) |
| **Date** | 2026-01-15 |

### Symptoms
- WhatsApp number and Province/City entered during onboarding are not saved.
- Data appears lost after registration.

### Root Cause
1. Frontend was not sending `provinceId`, `cityId`, `whatsapp` in registration request.
2. Backend validation schema was not accepting these fields.

### Solution
1. Update frontend registration call to include location fields.
2. Update backend `registerSchema` to accept optional fields:
```typescript
body: z.object({
    // ...existing fields
    provinceId: z.string().optional(),
    cityId: z.string().optional(),
    whatsapp: z.string().optional(),
})
```

### Prevention
- Verify all form fields are included in API request payload.
- Test full registration flow after onboarding changes.

### Related Files
- `client/src/pages/OnboardingPage.tsx`
- `server/src/routes/auth.routes.ts`
- `server/src/controllers/auth.controller.ts`

---

## TS-013: View As Auto-Navigation Issue

| Field | Value |
|---|---|
| **Category** | UI |
| **Severity** | Medium |
| **Effort** | Medium (15m-1h) |
| **Date** | 2026-01-16 |

### Symptoms
- Super Admin "View As" search field causes immediate navigation while typing.
- System resets to Super Admin profile before user finishes typing SIP ID.

### Root Cause
`useEffect` was triggering API calls on every character change instead of on user confirmation.

### Solution
Implement debounced input with explicit confirmation:
1. Only trigger simulation on Enter key or dropdown selection.
2. Prevent auto-fetch until user confirms.

### Prevention
- Always debounce user input before triggering API calls.
- Require explicit user action for navigation changes.

### Related Files
- `client/src/components/layout/Header.tsx`
- `client/src/context/AuthContext.tsx`

---

## TS-014: Coach Score Submission Blocked

| Field | Value |
|---|---|
| **Category** | API |
| **Severity** | High |
| **Effort** | Quick (<15m) |
| **Date** | 2026-01-11 |

### Symptoms
- Athletes cannot save their own scoring sessions.
- Submit returns 403 Forbidden.

### Root Cause
Backend `/scores/submit` endpoint only allowed COACH role, not ATHLETE.

### Solution
1. Make `coachId` optional in `ScoringRecord` model.
2. Update route to allow ATHLETE role:
```typescript
// Allow self-submission for athletes
if (req.user?.role === 'ATHLETE') {
    data.coachId = null;
    data.athleteId = req.user.athleteId;
}
```

### Prevention
- Consider self-service use cases when designing role-restricted endpoints.

### Related Files
- `server/src/routes/score.routes.ts`
- `server/prisma/schema.dev.prisma`

---

## TS-015: Multi-Role System Import Errors

| Field | Value |
|---|---|
| **Category** | Build |
| **Severity** | Medium |
| **Effort** | Quick (<15m) |
| **Date** | 2026-01-16 |

### Symptoms
- `AddRolePage.tsx` and `RoleRequestsAdminPage.tsx` throw import errors.
- Components reference non-existent exports.

### Root Cause
Circular dependencies or missing exports in shared type files after multi-role refactoring.

### Solution
1. Verify all imported types exist in source files.
2. Use `export type { X }` for type-only exports.
3. Check for typos in import paths.

### Prevention
- Run `tsc --noEmit` before committing to catch import errors.

### Related Files
- `client/src/pages/AddRolePage.tsx`
- `client/src/pages/RoleRequestsAdminPage.tsx`

---

## TS-016: Profile Controller Duplicate Identifier

| Field | Value |
|---|---|
| **Category** | Backend |
| **Severity** | High |
| **Effort** | Quick (<15m) |
| **Date** | 2026-01-12 |

### Symptoms
- Profile update endpoint fails with "Duplicate identifier" TypeScript error.
- Lines 259-260 of `profile.controller.ts` show compilation errors.

### Root Cause
Variable name collision in the controller code - two variables with the same name in the same scope.

### Solution
Rename one of the conflicting variables:
```typescript
// Before
const userData = ...;
const userData = ...; // ERROR: Duplicate

// After
const userData = ...;
const athleteData = ...; // Fixed
```

### Prevention
- Use descriptive variable names that reflect their purpose.
- Enable strict TypeScript mode to catch these early.

### Related Files
- `server/src/controllers/profile.controller.ts`

---

## TS-017: Prisma Upsert Missing Required Field

| Field | Value |
|---|---|
| **Category** | Database |
| **Severity** | High |
| **Effort** | Medium (15m-1h) |
| **Date** | 2026-01-12 |

### Symptoms
- Athlete profile creation fails with "Argument 'dateOfBirth' is missing" error.
- Prisma `upsert` operation throws validation error.

### Root Cause
When using Prisma `upsert`, the `create` payload must explicitly include all required fields. The code was relying on spreading an object that didn't include `dateOfBirth`.

### Solution
Explicitly construct the `create` payload for Prisma upsert:
```typescript
await prisma.athlete.upsert({
    where: { userId: user.id },
    create: {
        userId: user.id,
        dateOfBirth: new Date(data.dateOfBirth), // Explicit
        gender: data.gender,
        archeryCategory: data.archeryCategory,
        // ... other required fields
    },
    update: { ...updateData },
});
```

### Prevention
- Always explicitly define `create` payloads for upsert operations.
- Don't rely on object spreading for required fields.

### Related Files
- `server/src/controllers/profile.controller.ts`

---

## TS-018: Shell Redirection File Corruption

| Field | Value |
|---|---|
| **Category** | Build |
| **Severity** | Critical |
| **Effort** | Long (1h+) |
| **Date** | 2026-01-10 |

### Symptoms
- File grows to 100MB+ unexpectedly.
- VS Code/Cursor becomes unresponsive.
- File deletion fails with "file in use" error.

### Root Cause
Using shell redirection commands like `type file >> file` or `cat file >> file` causes infinite recursion, appending a file to itself endlessly.

### Debug Steps
1. Check file size immediately if editor becomes sluggish.
2. If file is massive, kill the editor process FIRST.

### Solution
1. Kill VS Code/Cursor via Task Manager.
2. Delete the corrupted file.
3. Restore from git: `git checkout -- filename.ts`

### Prevention
- **NEVER** use `>>` redirection to append a file to itself.
- Use `copy /b file.ts +,,` to safely update timestamps.
- Add this as a forbidden pattern in team guidelines.

### Related Files
- Any file that was target of redirection

---

## TS-019: Agent Password Reset Deviation

| Field | Value |
|---|---|
| **Category** | Process |
| **Severity** | Medium |
| **Effort** | Quick (<15m) |
| **Date** | 2026-01-20 |

### Symptoms
- Standard credentials in `README.md` (e.g. `password123`) do not work.
- Login fails despite using documented password.
- Agent or developer previously worked on the system.

### Root Cause
An AI agent or developer reset the password to a temporary value (e.g., `admin123`) to resolve a login block quickly, but did not update `README.md` **AND failed to inform the user**.

### Solution
1. Try common temporary passwords: `admin123`, `123456`, `password`.
2. Reset password to `README.md` standard using `reset-admin-password.ts`.
3. Check `server/scripts` for any custom reset scripts left behind.

### Prevention
- **Agent Protocol**: Agents MUST use credentials from `README.md` first.
- **Mandatory Update**: If password reset is required, Agent MUST:
    1. Update `README.md` immediately.
    2. **Explicitly inform the user** of the new credentials.
- **Revert Changes**: Ideally, revert to standard credentials after troubleshooting.

### Related Files
- `README.md`
- `server/scripts/reset-admin-password.ts`

---

## TS-020: Input Field Icon Overlay

| Field | Value |
|---|---|
| **Category** | UI |
| **Severity** | Low |
| **Effort** | Quick |
| **Date** | 2026-01-20 |

### Symptoms
Decorative icons (e.g., Lock, Mail) inside input fields overlap with the placeholder text or typed content, making it difficult to read.

### Root Cause
Icons are positioned absolute left (`left-3`) but the input field lacks sufficient left padding (`pl-12` or similar) to accommodate the icon's width, or the padding was removed inadvertently.

### Debug Steps
1. Inspect the input field using browser developer tools.
2. Check `className` for padding utilities (`pl-10`, `pl-12`).
3. Verify if icons are present and if their `z-index` or positioning conflicts with text.

### Solution
1. **Remove Decorative Icons**: If not essential, remove the icons to simplify UI.
2. **Increase Padding**: If keeping icons, ensure input has `pl-10` or `pl-12`.
3. **Current Fix**: Removed decorative icons from Change Password Modal and Profile Forms to ensure clean UI.

### Prevention
- **Design Standard**: consistent use of input groups with icons requires matching padding.
- **Review**: Visual check of forms on different screen sizes.

### Related Files
- `client/src/components/profile/ChangePasswordModal.tsx`
- `client/src/components/profile/AthleteProfileSection.tsx`

---

## TS-029: Vite WebSocket/HMR Connection Failed

| Field | Value |
|---|---|
| **Category** | UI/Development |
| **Severity** | Low (Internal dev only) |
| **Effort** | Quick (<5m) |
| **Date** | 2026-01-25 |

### Symptoms
- Console full of `WebSocket connection to 'ws://localhost:5173/...' failed`.
- `[vite] failed to connect to websocket`.
- `manifest.json` returns `408 (Network Error)` or `Timeout`.
- Hot Module Replacement (HMR) stops working (browser won't auto-refresh on save).

### Root Cause
1. **Port Congestion**: Multiple Vite instances or heavy network traffic on port 5173 causing the HMR socket to time out.
2. **Zombie Processes**: A background `node.exe` is still holding the WebSocket port even after the terminal is closed.
3. **PWA Manifest Conflict**: The service worker or `vite-plugin-pwa` is trying to fetch the manifest before the dev server is fully ready.

### Debug Steps
1. Check if multiple tabs are open to the same `localhost:5173`.
2. Check Task Manager for zombie `node.exe` processes.
3. Verify `vite.config.ts` has correct server options.

### Solution
1. **Force Kill Node**:
   ```powershell
   taskkill /F /IM node.exe
   ```
2. **Standard HMR Config** (in `vite.config.ts`):
   Ensure `server.hmr` isn't using a conflicting port.
3. **Hard Reload**: Press `Ctrl + Shift + R` to clear the service worker cache that might be blocking the `manifest.json` request.

### Prevention
- Close unused browser tabs.
- Use `npm run dev` and wait for "Ready" before opening the browser.

### Related Files
- `client/vite.config.ts`
- `client/src/main.tsx`

When you fix a bug, add an entry using this template:





---

## TS-021: Localhost Sidebar Missing Modules

| Field | Value |
|---|---|
| **Category** | UI |
| **Severity** | Low |
| **Effort** | Quick (<5m) |
| **Date** | 2026-01-20 |

### Symptoms
- Sidebar menu on Localhost is missing items (e.g., "My Orders", "Catalog") that are visible on the Live environment.
- Codebase for permissions appears identical.

### Root Cause
**Local Storage Caching**. The browser caches the sidebar configuration in `sip_ui_settings_v7`. If this cache is older than the Permission code update, new default modules enabled in `permissions.ts` will not appear until the cache is cleared or updated.

### Debug Steps
1. Open DevTools > Application > Local Storage.
2. Check for `sip_ui_settings_v7`.

### Solution
1. Clear Local Storage for the site.
2. OR manually call `resetUISettings()` if available.
3. Refresh the page.

### Prevention
- Increase permissions version key (e.g., to `v8`) in `PermissionsContext.tsx` when making significant changes to default visibility.

### Related Files
- `client/src/context/PermissionsContext.tsx`


---


---

## TS-024: Live Avatar Uploads 404 (Ephemeral Storage)

| Field | Value |
|---|---|
| **Category** | Deployment |
| **Severity** | High |
| **Effort** | High (Migration) |
| **Date** | 2026-01-21 |

### Symptoms
- Avatar uploads work locally but disappear or return 404 on Render/Live.
- "Protocol mismatch" errors (Mixed Content) in browser console.

### Root Cause
1.  **Ephemeral Filesystem**: Render spins down instances, deleting local `uploads/` folder.
2.  **Relative URLs**: API returned `/uploads/...` which frontend tried to fetch from Vercel (404).

### Solution
**Migrated to Supabase Storage**:
1.  Implemented `StorageService` using `@supabase/supabase-js`.
2.  Refactored `upload.routes.ts` and `document.routes.ts` to use `multer.memoryStorage()`.
3.  Uploads now go directly to Supabase Bucket `avatars` or `documents`.

### Prevention
- Never use local disk storage for user-generated content in serverless/PaaS environments.

### Related Files
- `server/src/services/storage.service.ts`
- `server/src/routes/upload.routes.ts`

---

## TS-025: Troubleshooting Sync Failure (Localhost)

| Field | Value |
|---|---|
| **Category** | Backend |
| **Severity** | Medium |
| **Effort** | Quick |
| **Date** | 2026-01-21 |

### Symptoms
- "Sync Troubleshooting" button returns success but no new items appear in DB.
- `TS-023` (test item) was not being added.

### Root Cause
**Database Mismatch**: Running `npm run dev` (Production DB mode) while `DATABASE_URL` in `.env` pointed to SQLite (`file:./dev.db`). The server was connecting to the wrong DB or failing silently due to environment confusion.

### Solution
1.  Kill all zombie `node.exe` processes.
2.  Run `npm run dev:local` explicitly to ensure SQLite environment.
3.  Fix parser regex in `troubleshoot.routes.ts` (minor cleanup).

### Prevention
- Use `npm run dev:local` for all local feature development.

### Related Files
- `server/src/routes/troubleshoot.routes.ts`



## TS-022: Browser Verification 429 Errors

| Field | Value |
|---|---|
| **Category** | Tooling |
| **Severity** | Low |
| **Effort** | Quick |
| **Date** | 2026-01-20 |

### Symptoms
- Browser verification steps fail repeatedly with `429 Too Many Requests`.
- Screenshots cannot be captured.
- Terminal commands work fine.

### Root Cause
**Environment/Tooling Rate Limits**. The browser agent or the underlying proxy may hit rate limits when making rapid requests to the local dev server or when multiple agents attempt to access the browser context simultaneously.

### Solution
1. **Fallback to Manual Check**: Use `run_command` to verify backend state (e.g., seeding success).
2. **Simplify Steps**: Reduce the complexity of browser instructions.
3. **Wait**: Allow time before retrying.

### Prevention
- Do not rely solely on browser verification for critical tasks.
- Always check terminal output for backend success confirmation.

### Related Files
- N/A (Tooling Issue)

---

## TS-023: Live Avatar Upload Mixed Content / 404

| Field | Value |
|---|---|
| **Category** | Deployment/API |
| **Severity** | High |
| **Effort** | Quick (<15m) |
| **Date** | 2026-01-20 |

### Symptoms
- Avatar upload works on `localhost`.
- On Live (`app.corelink.id`), upload says "Success" but image is broken or not found.
- Browser Console shows:
    - **404 Not Found**: If URL is relative (`/uploads/...`).
    - **Mixed Content Error**: If URL is absolute but `http://` instead of `https://`.

### Root Cause
1.  **404 Error**: Frontend (Vercel) tries to fetch relative path (`/uploads/x.png`) from itself, but files are on Backend (Render).
2.  **Mixed Content**: Render usage of Load Balancer means the server sees `http` requests. By default, `req.protocol` returns `http`. When the API returns an `http://` URL to an `https://` frontend, the browser blocks it.

### Solution
1.  **Use Absolute URLs**:
    Update `upload.routes.ts` to return full URL:
    ```typescript
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    ```
2.  **Trust Proxy**:
    Update `index.ts` to trust the Load Balancer's `X-Forwarded-Proto` header:
    ```typescript
    app.set('trust proxy', 1); // Enable after app = express()
    ```

### Prevention
- Always enable `trust proxy` when deploying Express behind a Load Balancer (Render, Heroku, AWS).
- Always return absolute URLs for assets stored on the backend if frontend is on a different domain.

### Related Files
- `server/src/routes/upload.routes.ts`
- `server/src/index.ts`

---

## TS-026: PostgreSQL Migration Failure (DATETIME Syntax)

| Field | Value |
|---|---|
| **Category** | Database |
| **Severity** | High |
| **Effort** | Quick (<15m) |
| **Date** | 2026-01-23 |

### Symptoms
- `Prisma Migrate` fails when deploying to PostgreSQL (Render/Supabase/Neon).
- Error message: `syntax error at or near "DATETIME"` or `syntax error at or near "PRAGMA"`.
- Migration works fine on SQLite local development.

### Root Cause
SQLite uses the `DATETIME` storage class and `PRAGMA` statements for configuration, but PostgreSQL uses `TIMESTAMP` and does not support SQLite's `PRAGMA` syntax. Migrations generated for SQLite are often incompatible with PostgreSQL.

### Debug Steps
1. Check the migration logs during deployment.
2. Locate the failing `migration.sql` file.
3. Search for keywords `DATETIME` or `PRAGMA`.

### Solution
Perform a mass cleanup of all migration files:
1. Delete all lines containing the word `PRAGMA`.
2. Global Find & Replace `DATETIME` with `TIMESTAMP`.

Example command (PowerShell):
```powershell
Get-ChildItem -Path "prisma/migrations" -Filter "migration.sql" -Recurse | ForEach-Object { 
    $content = Get-Content $_.FullName; 
    $content = $content | Where-Object { $_ -notmatch 'PRAGMA' }; 
    $content = $content -replace 'DATETIME', 'TIMESTAMP'; 
    $content | Set-Content $_.FullName -Encoding UTF8 
}
```
Commit the changes and push to trigger a new deployment.

### Prevention
- Ensure migrations are finalized for production compatibility if developed using SQLite.
- Standardize on `TIMESTAMP` and avoid provider-specific SQL if possible.

### Related Files
- `sip/server/prisma/migrations/**/migration.sql`

---

## TS-027: Migration Conflict (Relation Already Exists)

| Field | Value |
|---|---|
| **Category** | Database |
| **Severity** | High |
| **Effort** | Quick (<10m) |
| **Date** | 2026-01-23 |

### Symptoms
- `Prisma Migrate` fails during deployment with error: `ERROR: relation "table_name" already exists`.
- Deployment logs show the specific migration name that failed.

### Root Cause
A mismatch between the actual database schema and the Prisma migration history table (`_prisma_migrations`). This often happens if:
1. A table was created manually or via `db push`.
2. A migration was partially applied then failed.
3. The database was restored from a backup without the migration history table.

### Debug Steps
1. Identify the failing migration name from the logs (e.g., `20260114033705_add_general_document_model`).
2. Verify if the table already exists in the database using a GUI or SQL shell.

### Solution

#### Option A: Resolve & Sync (Preserve Data)
Mark the problematic migration as applied manually:
```bash
npx prisma migrate resolve --applied <migration_name>
```

#### Option B: Nuclear Reset (Clean Slate - Recommended for Trial/Dev)
If data is dummy or can be deleted, reset the schema to ensure 100% synchronization:
1. Go to Neon Dashboard -> SQL Editor.
2. Run:
   ```sql
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   ```
3. In Render, ensure Start Command is: `npx prisma migrate deploy && npx tsx src/index.ts`.
4. Trigger **Manual Deploy**.

### Stable Render Configuration
To prevent future drift and ensure zero-downtime database updates, always use:
- **Build Command**: `npm install && npx prisma generate`
- **Start Command**: `npx prisma migrate deploy && npx tsx src/index.ts`
  > [!NOTE]
  > This is the industry standard for production Prisma apps. `migrate deploy` only applies pending migrations without requiring user confirmation, which is ideal for CI/CD environments like Render.

### Prevention
- **NEVER** use `npx prisma db push` on a live/production database (Neon). It bypasses migration history and causes schema drift.
- **ALWAYS** use `npx prisma migrate dev` in your local development environment to generate migration files.
- Commit all migration folders in `prisma/migrations/` to Git.
- Use the stable `Start Command` mentioned above to let Render handle migrations automatically upon deployment.

### Related Files
- `sip/server/prisma/schema.prisma`

---

## TS-028: Database Reset & Restore Point

| Field | Value |
|---|---|
| **Category** | Database |
| **Severity** | Medium |
| **Effort** | Medium (15m-1h) |
| **Date** | 2026-01-24 |

### Symptoms
- Database state is inconsistent or corrupted after multiple development sessions.
- Roles or permissions are fragmented.
- Need to return to the "Standardized SIP Baseline" (Blueprint v3.0).

### Root Cause
Development drift or unsuccessful migrations.

### Solution: Full System Restore
This procedure wipes the local database and re-seeds it with the **Master Logic** (Unified Roles, Standard SIP IDs, Sidebar 2.0).

1. **Stop the Server** (Ctrl+C).
2. **Execute Full Reset**:
```powershell
cd server
npm run db:reset:local
```
*(This command runs `prisma migrate reset` which applies all migrations and runs `prisma/seed.ts`)*.

3. **Verify Restoration**:
Log in as `admin@sip.id` / `superadmin123` to confirm the state.

### Alternative: Safe Calibration (No Wipe)
If you want to fix roles/sidebar without deleting your data:
```powershell
cd server
npx tsx src/scripts/calibrate_roles.ts
```

### Prevention
- Avoid manual database edits using Prisma Studio for core structural data (Roles, Permissions).
- Use `seed.ts` to manage default configurations.

### Related Files
- `server/prisma/seed.ts`
- `server/src/scripts/calibrate_roles.ts`
- `server/src/services/sipId.service.ts`



## 2026-01-26: Login Failure (401 / Crash)
- **Problem**: User reported "cant login" and "connection refused".
- **Root Cause 1**: `JSON.parse` in `auth.controller.ts` crashed on undefined/malformed `manpower.shortcuts` data.
- **Root Cause 2**: Dev servers were down.
- **Solution 1**: Implemented `safeJsonParse` helper in `auth.controller.ts`.
- **Solution 2**: Restarted backend (`npm run dev` port 5000) and frontend (`npm run dev` port 5173).

## 2026-01-26: AuthContext 401 on Reload
- **Problem**: Console showed 401 on `/auth/me` after restart.
- **Analysis**: Normal behavior. Stale token in local storage invalid after server restart/session expiry.
- **Action**: AuthContext correctly cleared storage and reset state. No code fix needed.

## 2026-01-27: Event Management Page Syntax Cascade
- **Problem**: 500 Internal Server Error & "Cannot find name" errors.
- **Root Cause**: Accidental closure of Component Function prematurely due to extra `</div>` and `}` tags in `EventManagementPage.tsx` (Timeline/Rundown tabs).
- **Solution**: Performed deep audit of tab nesting. Removed 3 orphan closing tags and restored missing Root div. Structure is now correct.

---

## TS-030: White Screen (Fatal 500) After Module Refactor

| Field | Value |
|---|---|
| **Category** | Frontend / Build |
| **Severity** | Critical |
| **Effort** | Medium (15m-30m) |
| **Date** | 2026-01-27 |

### Symptoms
- Application loads a completely white screen.
- Browser console shows 500 Internal Server Error pointing to a specific file (e.g., ClubPermissionsPage.tsx).
- Network tab shows 500 error for that file.
- Occurs after renaming directories (e.g., modules/event to modules/events).

### Root Cause
1.  **Stale Vite Cache**: The node_modules/.vite directory retains references to the old file paths.
2.  **Invalid Imports**: Files still contain imports pointing to the old directory structure (e.g., ../../event/... instead of ../../events/...).
    - *Note:* Build tools might not catch dynamic lazy(() => import(...)) errors until runtime.

### Debug Steps
1.  Check browser console for the specific file causing the 500 error.
2.  Open that file and look for imports matching the old directory structure.
    - Example: import ... from '../../event/pages/...'
3.  Verify if grep or search finds instances of the old path.

### Solution
1.  **Fix Imports**: Update all invalid imports to the new path.
    - Use grep -r 'old/path' client/src to find them.
    - Manually check lazy imports.
2.  **Deep Clean**:
    - Stop the dev server.
    - Delete the Vite cache: Remove-Item -Path 'client/node_modules/.vite' -Recurse -Force
3.  **Restart Server**:
    - Run npm run dev in the client directory.

### Prevention
- When refactoring folder structures, always perform a global search for the old path string.
- Manually check lazy imports as typical IDE refactoring tools might miss them inside strings.
- Clearing .vite cache is a standard first step after major move operations.

### Related Files
- client/src/modules/club/pages/ClubPermissionsPage.tsx (primary culprit in this case)
- client/vite.config.ts

---

## TS-031: Git Executable Path Deviation

| Field | Value |
|---|---|
| **Category** | Environment / System |
| **Severity** | High |
| **Effort** | Low (Config fix) |
| **Date** | 2026-01-27 |

### Symptoms
- 'Restore' tab gives 'Failed to fetch git history'.
- Backend log shows spawn git ENOENT or 'Command not found'.
- git command works in some terminals but not in the Node.js process.

### Root Cause
- The system PATH does not contain a valid git.exe, or Node process cannot see it.
- A functional Git executable was found in a non-standard location: d:\Antigravity\_archive\Git_Trash\cmd\git.exe.

### Solution (Temporary)
- Hardcoded the absolute path to the archived Git executable in server/src/modules/core/system/git.service.ts.

### Solution (Architectural Fix Required)
- **Problem**: Relying on _archive folder makes the app non-portable.
- **Recommendation**:
    1.  Install Git properly on the host machine and add to PATH.
    2.  OR Bundle a portable Git binary within sip/tools/git if the environment is strict.
    3.  Update git.service.ts to use process.env.GIT_PATH instead of hardcoding.

### Related Files
- server/src/modules/core/system/git.service.ts

---

## TS-034: Laptop Migration & Node.js Installation

| Field | Value |
|---|---|
| **Category** | Environment / Migration |
| **Severity** | High |
| **Effort** | Medium (30m) |
| **Date** | 2026-01-28 |

### Symptoms
- Project cloned to new laptop but fails to run (`npm install` not recognized).
- Database login fails because it's a "fresh" local setup.
- Multiple "Installation" windows (Chocolatey/Visual Studio Build Tools) appearing and stalling.

### Root Cause
1. **Node.js/NPM Missing**: New environment lacks the core runtime and package manager.
2. **Empty Local DB**: Migration via Git only carries code, not the SQLite data files (which are in `.gitignore`).
3. **Bloated Installer**: The default Node.js installer often tries to download unnecessary build tools (Python/C++) that aren't required for this project.

### Solution
1. **Essential Install**: Use the Standalone Node.js LTS installer. Skip/Close the "Additional Tools" terminal window once the core install is done to save space and time.
2. **Environment Sync**: Setup `.env` to match PC (`PORT=5000`, `DATABASE_URL="file:./dev.db"`).
3. **Database Initialization**: Run `npm run db:setup:local` to create the schema and seed the initial Admin data.

### Prevention
- Ensure Node.js is pre-installed before attempting to run Agent scripts on new devices.
- Always perform a `db:setup:local` after cloning to a fresh environment.

## TS-032: Module Not Found (Relative Paths)

| Field | Value |
|---|---|
| **Category** | Backend |
| **Severity** | High |
| **Effort** | Quick (<15m) |
| **Date** | 2026-01-28 |

### Symptoms
- Server crashes or seed scripts fail with 'Cannot find module ../services/...' errors.

### Root Cause
Services were moved from global 'src/services' to module-specific folders (e.g., 'src/modules/auth') in accordance with the modular monolith architecture, but existing imports still referenced the old generic path.

### Solution
Update relative import paths to point to the correct internal module location (usually './service-name.js' if sibling) or use the specific module path.

### Prevention
When refactoring services into modules, audit all importing controllers and scripts to ensure path stability.

---

## TS-033: Architectural Terminology Violation

| Field | Value |
|---|---|
| **Category** | Standard |
| **Severity** | Low |
| **Effort** | Quick (<15m) |
| **Date** | 2026-01-28 |

### Symptoms
- IDE issues or architectural audits flag forbidden terms like 'Staff'.

### Root Cause
Rule 8 in 'architect.md' explicitly bans the term 'Staff' and requires 'Manpower' to be used exclusively.

### Solution
Perform a global search and replace to update all occurrences of 'Staff' (and related variable/module names like 'jersey_staff') to 'Manpower'.

### Prevention
Regularly review '.agents/architect.md' focus and restriction rules during development.
