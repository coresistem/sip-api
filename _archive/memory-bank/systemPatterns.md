# System Patterns & Architectures

## Mirroring Pattern
Frontend and Backend directories are designed to be mirrors of each other for easy navigation.
- **Frontend**: `client/src/modules/<module_name>`
- **Backend**: `server/src/modules/<module_name>`

## Module Structure
Each module should follow this internal organization:
### Backend
- `*.routes.ts`: Route definitions.
- `*.controller.ts`: Request/Response handling.
- `*.service.ts`: Business logic (Keep controllers thin).

### Frontend
- `pages/`: Main route components.
- `components/`: Specific UI components for that module.
- `services/`: API call wrappers.

## Multi-Role JSON Pattern (The Root)
A single `User` can have multiple roles stored in the `roles` field (JSON string).
- **Format**: `["ATHLETE", "COACH", "CLUB_ADMIN"]`
- **Active Role**: The `activeRole` field determines the current UI context.
- **Identity Integrity**: Biological data must ALWAYS be fetched from the `User` model, never duplicated in sub-profiles.

## Core Rules
1. **The Mirroring Law**: Frontend folder `client/src/modules/X` must ALWAYS mirror Backend folder `server/src/modules/X`.
2. **DILARANG** (FORBIDDEN) saling mengimpor antar modul domain (misal: `athlete` import `club`). Semua komunikasi lintas-modul harus dilakukan via `core` atau lewat database relations.
3. **Selective Includes**: Saat melakukan Prisma queries, gunakan `select` untuk mengambil hanya data yang dibutuhkan untuk performa maksimal.
4. **Glass Aesthetic**: Gunakan Tailwind class kombinasi `backdrop-blur-*`, `bg-opacity-*`, dan `border-white/10` untuk konsistensi UI "Unified Pro".
