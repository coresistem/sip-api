# Technical Decisions

## 2026-01-22: Adoption of Cline Memory Bank
*   **Decision**: Implement a `memory-bank/` directory and `.clinerules` file at the root of the workspace.
*   **Rationale**: To provide Antigravity (and potentially Cline) with a persistent "brain" that tracks project context, reducing re-explanation time and improving task accuracy.
*   **Impact**: Simplifies context loading for the AI and provides a human-readable summary of project health.

## 2026-01-19: Multi-Role System Architecture
*   **Decision**: Use a relational mapping in Prisma to allow a single User to have multiple Role records.
*   **Rationale**: Flexibility for users who are both Athletes and Coaches, or Admins and Parents.

## 2026-01-22: Installation of Awesome Skills
*   **Decision**: Install the `antigravity-awesome-skills` library into `.agent/skills`.
*   **Rationale**: To provide a broad library of 235+ curated agentic skills for better development, security, and UI/UX specialized workflows.
*   **Impact**: Enables specialized skills like `senior-fullstack`, `systematic-debugging`, and `ui-ux-pro-max` within the SIP project environment.

## 2026-01-22: Decommissioning of Factory/System Modules & Admin UI Refactor
*   **Decision**: Fully removed the `Factory` and `System` modules from both client and server, and integrated the `Assessment Builder` into the `SuperAdminPage` tab system.
*   **Rationale**: The Factory and System modules were determined to be legacy/unused. Consolidating the Assessment Builder into the main admin view simplifies navigation and reduces code bloat.
*   **Impact**: Reduced bundle size, cleaner routing in `App.tsx`, and a more unified experience for Super Admins. Resolved specific double-loading issues caused by legacy HTML artifacts.
## 2026-01-25: WebSocket & PWA Development Stabilization
*   **Decision**: Disabled Service Worker registration on `localhost` and added explicit Vite HMR bypass logic to `sw.js`.
*   **Rationale**: The Service Worker was intercepting internal Vite HMR requests and `manifest.json` fetches, returning 408 Timeouts and breaking real-time development features.
*   **Impact**: Restores stable Hot Module Replacement (HMR) and clean console logs for local development.

## 2026-01-26: Immersive 'Csystem Market' UI Refinement
*   **Decision**: Adoption of viewport-adaptive full-screen hero sections (`70vh`/`90vh`) and balanced glass opacities (`dark-950/60`).
*   **Rationale**: To achieve a high-end, premium e-commerce feel that remains readable and accessible across devices. Simple fixed-height banners were insufficient for professional 'sticky' immersive layouts.
*   **Impact**: Significantly improved visual impact and functional clarity for the marketplace, establishing a new 'Glass' design pattern for the project.
+
+## 2026-01-30: Server Module Consolidation & Naming Unification
+*   **Decision**: Reorganize server `src/modules` into 4 primary galaxies (`core`, `athlete`, `club`, `event`) and rename `competition` (server) / `events` (client) to a unified `event`.
+*   **Rationale**: To strictly follow the "Modular Galaxy Rule" defined in `BLUEPRINT_V2.md` and eliminate mirroring inconsistencies that cause confusion and broken imports.
+*   **Impact**: Reductions in root-level folder bloat, cleaner route registration in `index.ts`, and a codebase that is 100% compliant with the project constitution.
+
