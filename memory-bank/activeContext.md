# Active Context - Jan 2026 (Phase 3: Root Identity)

## Current Focus
We are currently in **Phase 3: Root Identity & Lab Consolidation**. The goal is to strengthen the foundation by unifying identity data and professionalizing the experimental features.

## What's been done
- [x] **Root Identity Migration**: 
    - Migrated `dateOfBirth` and `gender` from individual profiles (Athlete, Coach) to the root `User` model.
    - Updated `profile.controller.ts` and `MasterProfileSection.tsx` to handle these unified fields.
- [x] **Innovation Control Panel**:
    - Created the infrastructure to manage experimental features (Labs).
    - Mounted `labFeatures` routes in the backend.
    - Integrated `AssessmentBuilder` into the Labs system.
- [x] **Database Optimization**:
    - Confirmed SQLite for local dev (`dev.db`).
    - Standardized `prism db push` workflows using CMD wrappers for execution policy safety.

## What's Next
- [ ] **Execute Role Integration Protocol**: Implement the "Handshake" system where Athletes can propose joining a Club, and Clubs can verify.
- [ ] **Security Scoping (Phase 4)**: Define granular permissions for `SUPER_ADMIN` vs `CLUB_ADMIN` vs `MANPOWER`.
- [ ] **Super Admin Page Migration**: Finalize the transition of legacy admin tools to the new unified Admin Galaxy.

## Current Blockers
- **500 Errors (Login)**: Internal Server Error occurred during browser login. 
    - *Investigation status*: Backend successfully started on port 5000. `curl` login works, but browser login fails.
    - *Recent finding*: `EPERM` error on Prisma Client generation due to process locks.
    - *Next action*: Force-kill all node/prisma processes, regenerate client, then re-test login.
