# 🌳 THE CORELINK GENESIS TREE (Master Roadmap)
**Status:** 🔄 Implementing THE ROOTS
**Objective:** Building an immutable architectural foundation for Csystem SIP, starting with the core identity and inter-role integration.

---

## 🌳 PART 1: THE FRUIT LOGIC (Economic Engine)
*Concept: "ECOSYSTEM DIVIDEND" - Driving user adoption through valid data (CorePoints) and revenue sharing.*

- [ ] **CorePoints Logic**: Define system for rewarding "Verified" data inputs.
- [ ] **Revenue Share (Club)**: Implement 2.5% Admin Fee cashback logic for verified athlete registrations.
- [ ] **School Partnership**: Implement "Free for Life" license flag for स्कूलों providing NISN verification.
- [ ] **Supplier Discount**: Link Marketplace items to "Corelink Member Discount" (5%).

---

## 🌳 PART 2: THE ROOTS (System Foundation)
*Priority: 🛠️ Phase 1 Execution (80% Ready)*

- [ ] **ID Refactor**: Complete the final migration from legacy `sipId` to `coreId` across all tables.
- [ ] **Unified Multi-Role Auth**: 
    - Ensure `User.roles` (JSON) handles multiple roles (Athlete, Coach, etc.) for a single identity.
    - Validate shared `nik`, `whatsapp`, and `location` across all active roles.
- [x] **Prisma Optimization**: Ensure `select` queries are optimized for modular separation (Mirroring Law).

---

## 🌳 PART 3: THE TRUNK (Mirroring The Flow)
*Priority: 🏗️ Architectural Symmetry*

- [x] **Frontend Module Mirroring**: Create missing module folders in `client/src/modules/`:
    - [x] `school/`: UI for Student Verification & School Dashboard.
    - [x] `supplier/`: UI for Catalog Management & Sales.
    - [x] `perpani/`: UI for Federation Regulation & Verified Badges.
- [ ] **Shared Layouts**: Ensure the "Trunk" supports dynamic role switching without full page reloads.

---

## 🌳 PART 4: THE BRANCHES (9 Cabang Kehidupan)
*Implementation detail per domain.*

### 🌿 CABANG 1: THE CLUB (Revenue & Self-Reg)
- [ ] **Self-Reg Flow**: Connect registration forms to `ClubJoinRequest` (Status: PENDING).
- [ ] **Auto-Billing**: Cron Job for `MembershipFee` invoices every 1st of the month.
- [ ] **Asset Management**: Activate `AssetInventory` for bow/equipment tracking.

### 🌿 CABANG 2: THE ATHLETE (Traffic)
- [ ] **Identity Card**: UI showing `coreId` with dynamic QR Code.
- [ ] **Performance Tracking**: UI for `ScoringRecord` with chart visualization of `arrowScores` (JSON).

### 🌿 CABANG 3: THE COMMERCE (Factory Logic)
- [ ] **Supplier Lite**: Simple marketplace for finished goods.
- [ ] **Legacy Factory (HIDDEN)**: Keep `Manpower`, `QCInspection`, etc. isolated for Phase 3.

### 🌿 CABANG 4: THE EVENT (The Bridge)
- [ ] **Ianseo Integration**: "Export to Ianseo" feature converting registration data to verified CSV.
