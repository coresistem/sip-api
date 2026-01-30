# 🗺️ ROLE INTEGRATION & APPROVAL ROADMAP
**Status:** 🆕 Priority Task (Architecture Level)
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
- [ ] **History Logs**: Implementasikan view/layanan untuk Super Admin melihat "Audit Trail" dari satu user untuk melacak sejarah integrasi antar organisasi.

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
- [ ] **Integration Status Badge**: 
    - Tampilkan status (`Pending`, `Verified`, `Rejected`) pada profil user dengan tooltip yang merujuk pada "Approved by [Org Name]".
- [ ] **Audit View for Organizations**: 
    - Tambahkan tab "Security/Log" pada Dashboard Club untuk melihat siapa saja yang memberikan/menerima akses data dalam 30 hari terakhir.

## 🛡️ 4. Security & Compliance
*Tujuan: Memastikan privasi data terjaga.*

- [ ] **Multi-Role Scoping**: Pastikan dashboard hanya menampilkan data user yang sudah berstatus `Verified`.
- [ ] **Revoke Access Logic**: Implementasikan fitur "Unlink/Resign" yang otomatis memutus akses data dan mencatat audit log "Access Revoked".

---

### **Execution Priority:**
1. **Back-end Audit Infrastructure** (Agar setiap aksi terekam sejak hari pertama).
2. **Notification Action Payload** (Membangun jembatan UI).
3. **Review & Implementation of Integration Service** (Logic utama).
4. **UI Polishing** (Premium Glass Aesthetic for Notification actions).
