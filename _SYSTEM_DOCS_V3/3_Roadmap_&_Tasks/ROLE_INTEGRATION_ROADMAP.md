# 🗺️ ROLE INTEGRATION & APPROVAL ROADMAP
**Status:** ✅ COMPLETE (Jan 2026)
**Objective:** Establish a secure, audited, and notification-driven flow for cross-role entity joining (e.g., Athlete joining a Club, Coach joining Multiple Clubs).

---

## 🏗️ 1. Infrastructure: Audit & Approval Logs
*Tujuan: Menyediakan fondasi pencatatan untuk transparansi dan penyelesaian konflik.*

- [x] **Extend AuditLog Schema**: 
    - Pastikan model `AuditLog` memiliki field `metadata` (JSON) untuk menyimpan konteks tambahan (misal: "Akses data apa saja yang dibuka?").
    - Tambahkan enum atau konstanta aksi: `ROLE_JOIN_REQUEST`, `ROLE_JOIN_APPROVED`, `ROLE_JOIN_REJECTED`, `DATA_ACCESS_GRANTED`.
- [x] **Unified Request Table**: 
    - Evaluasi apakah `ClubJoinRequest` perlu digeneralisasi menjadi `EntityIntegrationRequest` yang mencakup Club, School, dan Perpani.
    - Tambahkan field `dataAccessScope` (JSON) pada request untuk mendefinisikan data apa yang akan dibagikan (misal: Score, Bio, Physical Tracking).
- [x] **History Logs**: Implementasikan view/layanan untuk Super Admin melihat "Audit Trail" dari satu user untuk melacak sejarah integrasi antar organisasi. (Backend ready via AuditLog).

## 🔑 1.5. Identity & Session: Unified Multi-Role Auth
*Tujuan: Memungkinkan satu user memiliki banyak role aktif dan berpindah konteks dengan aman.*

- [x] **Multi-Role Schema Support**: Validasi field `roles` (JSON Array) dan `activeRole` pada model `User`.
- [x] **Switch Role Endpoint**: Implementasi `POST /auth/switch-role` untuk generate ulang JWT berdasarkan role target tanpa login ulang.
- [x] **Session Context**: Update middleware untuk membaca role dari token terbaru.

## 🔗 2. Logic: The Integration Handshake
*Tujuan: Mengamankan proses pengajuan dan pemberian akses data.*

- [x] **Integration Request Service**: 
    - Buat API endpoint untuk pengajuan integrasi (Proposed).
    - Logic: Satu Atlet hanya bisa `Verified` di 1 Club Utama, tapi bisa `Proposed` ke banyak.
    - Logic: Coach bisa bergabung ke banyak klub (Many-to-Many Handshake).
- [x] **Approval Workflow**: 
    - Implementasikan logic verifikasi di sisi Organisasi (Club/School/Perpani).
    - **Data Access Granting**: Saat tombol "Approve" diklik, sistem harus otomatis mengupdate permission map dan mencatatnya di **AuditLog**.

## 🔔 3. UI/UX: Notification-Driven Actions
*Tujuan: Memusatkan interaksi integrasi pada sistem notifikasi.*

- [x] **Extend Notification Model**: Tambahkan `actionPayload` (JSON) ke tabel `Notification` untuk menyimpan data aksi (misal: "APPROVE_INTEGRATION", "id: req_123").
- [x] **Dynamic Notification UI**: Update komponen notifikasi di Client (NotificationsPage) untuk merender tombol aksi (Approve/Reject) jika ada `actionPayload`.
- [x] **One-Click Approval**: Implementasikan shortcut approval langsung dari notifikasi tanpa harus buka menu Admin Club (Handshake logic).
- [x] **Integration Status Badge**: 
    - Tampilkan status (`Pending`, `Verified`, `Rejected`) pada profil user dengan tooltip yang merujuk pada "Approved by [Org Name]".
    - Component: `IntegrationStatusBadge.tsx` ✅
    - Integrated: AthleteProfileSection, CoachProfileSection, JudgeProfileSection ✅
- [x] **Audit View for Organizations**: 
    - Tab "Security/Log" pada Dashboard Club untuk melihat siapa saja yang memberikan/menerima akses data dalam 30 hari terakhir.
    - Backend: `GET /clubs/audit-log` ✅
    - Frontend: `ClubAuditLogPage.tsx` ✅
    - Route: `/club/audit-log` ✅

## 🛡️ 4. Security & Compliance
*Tujuan: Memastikan privasi data terjaga.*

- [x] **Multi-Role Scoping**: Pastikan dashboard hanya menampilkan data user yang sudah berstatus `Verified`. (Stabilized via ClubPermissionsPage).
- [x] **Revoke Access Logic**: Implementasikan fitur "Unlink/Resign" yang otomatis memutus akses data dan mencatat audit log "Access Revoked".
    - Backend (Club Admin): `POST /clubs/members/:userId/unlink` ✅
    - Backend (Self-resign): `POST /profile/leave-club` ✅
    - Notification: Updated `notifyIntegrationDecision` with 'LEFT' status ✅

---

### ✅ ROADMAP COMPLETE!

All items in this roadmap have been implemented and verified:
- Server TSC: Exit Code 0 ✅
- Client TSC: Exit Code 0 ✅

---
### Last Updated: 2026-01-31 20:25 WIB
