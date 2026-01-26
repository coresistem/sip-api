# Memory Bank

## Latest Progress
- **Backend Fix**: Resolved missing `manpower` relation in `auth.controller.ts` causing 401/crashes. Added `safeJsonParse` for robustness.
- **Frontend Restoration**: Restarted both client and server after "connection refused" errors.
- **Manpower UI**: Refined `ManpowerPage.tsx`:
    - Swapped Email/Phone inputs.
    - Renamed "Phone" to "Whatsapp (direct message)".
    - Removed "Daily Capacity".
    - Made "Feature Shortcuts" conditional on Position selection.

## Pending Tasks
- **Testing**: Verify Manpower creation flow end-to-end.
- **Cleanup**: Remove any unused legacy Manpower fields if confirmed safe (e.g. database schema cleanup for `dailyCapacity` if permanently deprecated).

## Active Context
- **Files**:
    - `server/src/controllers/auth.controller.ts` (Auth logic, JSON parsing)
    - `client/src/modules/club/pages/ManpowerPage.tsx` (UI changes)
    - `server/prisma/schema.prisma` (Reference for Manpower model)
