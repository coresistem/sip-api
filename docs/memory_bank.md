# Memory Bank

## Latest Progress
- **Event Creation UX**: Improved the multi-step form flow in `EventCreationPage.tsx` and `EventManagementPage.tsx`:
    - Moved **Event Description** to Step 1 (General Information).
    - Moved **Roles & Regulations** to Step 2 (Categories).
- **Backend Import Fixes**: Resolved critical module resolution errors in `seed.ts` and `auth.controller.ts` by correcting import paths for `sipId.service` and `whatsapp.service`.
- **Terminology Cleanup**: strictly followed `architect.md` by replacing **"Staff"** with **"Manpower"** globally in:
    - `client/src/modules/core/types/permissions.ts` (Renamed `jersey_staff` to `jersey_manpower`)
    - `server/prisma/seed.ts` (Renamed seed users and profile roles)
    - `server/src/modules/manpower/manpower.routes.ts`
    - `client/src/modules/club/features/inventory/pages/SupplierOrdersPage.tsx`
- **Modular Monolith Integrity**: Services moved to `modules/auth/` are now correctly referenced and term-compliant.

## Pending Tasks
- **Verification**: Manually test the Event Management editing flow to ensure the moved fields save correctly.
- **Role Verification**: Log in as a `SUPPLIER` or `MANPOWER` user to verify the sidebar and UI terminology changes.

## Active Context
- **Files**:
    - `server/src/modules/auth/auth.controller.ts` (Import stability)
    - `client/src/modules/core/types/permissions.ts` (Role & Module definitions)
    - `client/src/modules/events/pages/EventCreationPage.tsx` (Form logic)
    - `server/prisma/seed.ts` (Data consistency)
