# Active Context

## Current Status
Transitioning to **Phase 29: Admin & Feature Migration (Cleanup)**. Following the highly successful Marketplace UI restoration and refined 'Glass' aesthetic, we are now shifting focus to migrating legacy Admin, Finance, and Inventory pages into the modern modular architecture.

## Recent Changes
*   **Terminology Migration Complete**: Successfully migrated all instances of `sipId` to `coreId` across the entire codebase (schema, services, and UI) to align with Corelink Identity standards.
*   **Manpower Enforcement**: Replaced all "Staff" terminology with "Manpower" as per architectural guidelines.
*   **'Csystem Market' Restoration**: Fully localized and branded the Marketplace UI, implementing high-impact Hero Banners with cinematic viewport-based scaling (`70vh`/`90vh`).
*   **CI Build Stabilization**: Fixed critical broken imports and 'unknown' type errors in the Club module (Analytics, Child Detail, Assessment Form) that were blocking production builds.
*   **Cleanup**: Sanitized legacy `LoginPage.tsx` in `_archive` to resolve IDE errors and align with the new modular structure.

## Next Steps
*   [x] Complete `sipId` to `coreId` migration.
*   [x] Map remaining legacy pages in `_src_legacy/pages` to target modules.
*   [x] **Structural Cleanup (Modular Galaxy Rule)**: Reorganized server modules (Auth/Profile/Dashboard to `core`, Manpower/Perpani/School to `club`) and unified naming (`competition` -> `event`) to match Blueprint V2.
*   [ ] Migrate Super Admin management pages to `src/modules/admin`.
*   [ ] Migrate Finance and Inventory features to `src/modules/club/features`.
*   [ ] Implement consistent glass-transparent UI patterns across all newly migrated pages.
