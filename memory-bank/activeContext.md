# Active Context

## Current Status
Transitioning to **Phase 29: Admin & Feature Migration (Cleanup)**. Following the highly successful Marketplace UI restoration and refined 'Glass' aesthetic, we are now shifting focus to migrating legacy Admin, Finance, and Inventory pages into the modern modular architecture.

## Recent Changes
*   **'Csystem Market' Restoration**: Fully localized and branded the Marketplace UI, implementing high-impact Hero Banners with cinematic viewport-based scaling (`70vh`/`90vh`).
*   **Refined Glass Aesthetic**: Balanced transparency and readability using `backdrop-blur-3xl` and `dark-950/60` surfaces with top-down gradient shadows for navigation clarity.
*   **Immersive Navigation**: Implemented an edge-to-edge immersive header where content flows seamlessly behind transparent system bars.
*   **Universal Navigation Sync**: Synchronized all navigation constants (sidebar, header, shortcuts) to resolve role-based display inconsistencies.
*   **Auth Flow Hardening**: Fixed logout logic to correctly redirect to the PWA landing page and clear session-stale state.

## Next Steps
*   [ ] Map remaining legacy pages in `_src_legacy/pages` to target modules.
*   [ ] Migrate Super Admin management pages to `src/modules/admin`.
*   [ ] Migrate Finance and Inventory features to `src/modules/club/features`.
*   [ ] Implement consistent glass-transparent UI patterns across all newly migrated pages.
