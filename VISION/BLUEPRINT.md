# 🏗️ CSYSTEM BLUEPRINT: Architecture & Technical Rules
**Codename:** Corelink SIP (Built on Csystem Engine)
**Stack:** Vite (React) + Express (Node.js) + Prisma (PostgreSQL)
**Version:** 2.2 (Consolidated)

---

## 1. THE GOLDEN RULES (Hukum Tertinggi)

### For All Agents
1. **Context Isolation:** Work only within the specified module.
2. **The Mirroring Law:** Every Frontend module MUST have a Backend mirror.
3. **Core Dependency:** Modules import from `core`, NEVER from each other.
4. **The Laboratory Protocol**: Experimental features stay in `LABS/`.
5. **Memory Bank Protocol**: Update documentation at every `@endsession`.
6. **Productivity Protocol**: Executing `@sync` at start of session is MANDATORY.

### Terminology
- **BANNED:** "Staff" → Use **"Manpower"**
- **BANNED:** "sipId" → Use **"coreId"**

---

## 2. TEST CREDENTIALS

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@sip.id` | `c0r3@link001` |
| Perpani | `perpani@perpani.or.id` | `perpani123` |
| Club | `owner@archeryclub.id` | `clubowner123` |
| School | `school@sma1.sch.id` | `school123` |
| Athlete | `andi@athlete.id` | `athlete123` |
| Parent | `parent@mail.id` | `parent123` |
| Coach | `coach@archeryclub.id` | `coach123` |
| Judge | `judge@perpani.or.id` | `judge123` |
| EO | `eo@events.id` | `eo123456` |
| Supplier | `supplier@archeryshop.id` | `supplier123` |

---

## 3. DOMAIN MAP

### 🟢 MODULE: CORE (The Foundation)
- **Models:** `User`, `Account`, `Session`, `Notification`
- **Features:** Auth, RBAC, Profile, File Upload, Navbar, Sidebar
- **Location:** `src/modules/core`

### 🏹 MODULE: ATHLETE (The Player)
- **Models:** `Athlete`, `PhysicalTracking`, `Score`, `UserEquipment`
- **Features:** Dashboard, Scoring, Performance Charts, Equipment
- **Location:** `src/modules/athlete`

### 🏢 MODULE: CLUB (The Organizer)
- **Models:** `Club`, `ClubJoinRequest`, `Manpower`, `Certificate`
- **Features:** Members, Approval, Finance, Inventory, Schedules
- **Location:** `src/modules/club`

### 🏆 MODULE: EVENT (The Competition)
- **Models:** `Competition`, `CompetitionCategory`, `CompetitionResult`
- **Features:** Registration, Brackets, Live Score, Results
- **Location:** `src/modules/event`

### 🛒 MODULE: COMMERCE (Csystem Market)
- **Models:** `Product`, `Order`, `Cart`, `JerseyConfig`
- **Features:** Catalog, Jersey Customization, Order Tracking
- **Location:** `src/modules/commerce`

### 🛡️ MODULE: ADMIN (Super Power)
- **Models:** `AuditLog`, `RoleRequest`, `AppModule`
- **Features:** User Management, Role Verification, Module Builder
- **Location:** `src/modules/admin`

---

## 4. DIRECTORY STRUCTURE (Mirroring Pattern)

### Client-Side (`sip/client/src/`)
```
modules/
├── core/           # Shared UI, Auth, Contexts
├── athlete/        # Athlete-specific pages
├── club/           # Club management
├── event/          # Competition
├── commerce/       # Marketplace
└── admin/          # Super Admin
```

### Server-Side (`sip/server/src/`)
```
modules/
├── core/           # Auth, Profile, Notification
├── athlete/        # Athlete routes & logic
├── club/           # Club routes & logic
├── event/          # Event routes & logic
├── commerce/       # Commerce routes & logic
└── admin/          # Admin routes & logic
```

---

## 5. CODING STANDARDS

### Frontend
- **Styling:** Tailwind CSS (no separate .css files unless global)
- **Components:** Use shadcn/ui from `modules/core/components/ui`
- **Routing:** react-router-dom in `App.tsx`

### Backend
- **Database:** schema.prisma is the Holy Grail
- **Idempotency:** Migration scripts must be safe to re-run
- **Imports:** Use `.js` extension in ES modules

---

## 6. DEPLOYMENT

- **Platform:** Render.com
- **Database:** PostgreSQL
- **Migration:** Always modify `schema.prisma` first, then `npx prisma migrate dev`

---

## 7. AGENT PERSONAS

| Persona | Focus | Location |
|---------|-------|----------|
| `@architect` | System Design, Structure | `.agent/personas/architect.md` |
| `@backend` | API, Database, Prisma | `.agent/personas/backend.md` |
| `@frontend` | UI, Components, React | `.agent/personas/frontend.md` |

---

*This document consolidates technical rules from `BLUEPRINT_V2.md` and `.clinerules`.*
