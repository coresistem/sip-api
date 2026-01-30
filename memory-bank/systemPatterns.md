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

## Core Rules
1. **DILARANG** (FORBIDDEN) saling mengimpor antar modul domain (misal: `athlete` import `club`). Semua komunikasi lintas-modul harus dilakukan via `core` atau lewat database relations.
2. **Selective Includes**: Saat melakukan Prisma queries, gunakan `select` untuk mengambil hanya data yang dibutuhkan untuk performa maksimal.
3. **Glass Aesthetic**: Gunakan Tailwind class kombinasi `backdrop-blur-*`, `bg-opacity-*`, dan `border-white/10` untuk konsistensi UI.
