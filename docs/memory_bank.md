# Memory Bank

## Project Team & AI Ecosystem
- **The Architect**: User (Founder & Lead Developer).
- **Pak Mentor**: Google Gemini (via Browser) - Provide grand design, logic, and high-level guidance.
- **Si Cantik**: Google AI Studio - Handle deep technical experiments and "beautiful" logic.
- **Si Anti (Me)**: Antigravity IDE - The "Builder" executing code directly in the workspace.
- **Si Lapie**: The New Laptop - Making the dev environment mobile and flexible.

## Latest Progress
- **Terminology Migration Complete**: Migrated all `sipId` to `coreId` across schema, server, and client.
- **Lapie Onboarding Ready**: Implemented `systemPatterns.md` and Bootup Protocol in `.clinerules`.
- **Cleanup**: Sanitized legacy `LoginPage.tsx` in `_archive` folder.
- **Restore Point**: Pushed stable tag `v2.1-migration-stable` to GitHub.

## Active Status & Next Steps
- **Progress**: Cloud sync is complete. PC environment is stable and mirrored to GitHub.
- **Pending Tasks**:
    - **Lapie**: Perform initial `git pull`, `npm install`, and `db:setup:local`.
    - **Phase 29**: Start migrating `_src_legacy/pages/admin` to `src/modules/admin`.
- **Active Context**:
    - `server/prisma/schema.prisma` (Latest coreId updates)
    - `client/src/modules/core/contexts/AuthContext.tsx`
    - `docs/troubleshoot.md` (Added TS-035 for EPERM issues)
