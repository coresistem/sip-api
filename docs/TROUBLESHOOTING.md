# Troubleshooting Knowledge Base

> **For Agents & Developers**: Use this document to quickly diagnose and fix known issues. When you encounter a new bug, add an entry here.

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

## Adding New Entries

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

