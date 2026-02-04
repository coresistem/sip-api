# 🎯 CURRENT PHASE: Membership & Governance Foundation
**Status:** 🟢 ACTIVE  
**Focus:** Athlete Registration, Club Join Request Logic, & Parental Consent (<18yo)  
**Environment:** SQLite Dev Ready (`schema.dev.prisma`)  
**Last Session:** 2026-02-05 (Completed Athlete→Parent→Club flow end-to-end; Blueprint credentials seeded)

---

## 🚀 LATEST ACHIEVEMENT (Mata Akar)
- **Core Identity Alignment**: Refactoring schema dan backend agar registrasi fokus pada data identitas inti. Menghapus ketergantungan wajib pada data domain (seperti kategori panahan) saat pendaftaran. (Keputusan Architect: *Core Identity First*).
- **Seamless Parent Integration**: Implementasi logika **Auto-Discovery** berbasis WhatsApp. Parent yang mendaftar akan otomatis terhubung ke Child record jika nomor WhatsApp cocok dengan emergency contact atlet.
- **Prisma 5 Consistency**: Memastikan sistem tetap menggunakan Prisma v5.22.0 untuk stabilitas Modular Monolith, menghindari komplikasi dari v7 di tengah sprint.
- **Zero-Flash Onboarding**: Stabilisasi deep-link pendaftaran Role Parent via WhatsApp.
- **Athlete→Parent→Club Flow (E2E)**: WhatsApp Invite → Deep-link Register → Auto-link Parent to Athlete → Parent Find Club UI + Join Request → Notification to Club Owner.
- **Blueprint Credentials Seeded**: Dev DB now includes all test accounts (admin, athlete, parent, club, etc.) with correct passwords.

---

## Phase Narrative

Event Management & Club Finance are **temporarily PAUSED**.  
Semua energi sekarang diarahkan ke **pondasi Membership & Governance**:

- Setiap **Athlete** wajib punya jalur registrasi yang jelas (self-signup / via Parent).
- **Club membership** harus eksplisit: join request, approval, dan status `NO CLUB` terdokumentasi.
- Untuk user <18 tahun, semua aktivitas sensitif (registrasi, join club) harus melewati **Parental Consent**.

Dokumen ini menjadi pegangan utama sampai seluruh alur Membership & Governance stabil.

---

## 🎯 Phase Objectives

### 1. Athlete Registration Foundation
- Merapikan skema user/athlete agar siap dipakai lintas modul.
- Memastikan alur registrasi pertama kali (onboarding) selaras dengan state Membership/Club.

### 2. Club Join Request Logic
- Menstandarkan status club user: `NO_CLUB`, `PENDING`, `MEMBER`, `LEFT`.
- Menyatukan alur:
  - Athlete tanpa club melihat state yang konsisten di Dashboard.
  - Join request selalu tercatat dan bisa dilacak.
  - Admin/Club Owner punya kontrol yang jelas untuk approve/reject.

### 3. Parental Consent (<18yo)
- Mendefinisikan kapan consent dibutuhkan (registrasi, join club, event tertentu).
- Menambahkan flag/struktur data untuk menyimpan riwayat consent.
- Menyiapkan UI/UX dasar agar Parent mengerti apa yang disetujui.

---

## 🧱 Scope In / Scope Out

**Scope IN (aktif):**
- Membership status & governance rules.
- Integrasi UI/Backend untuk state `Club Not Assigned`.
- Parent-child relationship terkait izin (consent).

**Scope OUT (dipause sementara):**
- Fitur baru di Event Management (kategori, bracket, analytics).
- Club Finance & auto-billing.

Semua pekerjaan Event/Finance yang sudah selesai tetap dianggap **stabil**, tapi tidak jadi fokus iterasi sekarang.

---

## 🔧 Technical Focus Areas

### Frontend
- Modul utama: `client/src/modules/core` dan `client/src/modules/club`.
- Halaman kunci:
  - `Dashboard` (state "Club Not Assigned").
  - Onboarding/Registration flow (athlete + parent).
- UX: jelas membedakan user yang sudah punya club vs belum.

### Backend
- Modul utama: `server/src/modules/core` dan `server/src/modules/club`.
- Endpoint yang perlu distandardkan (contoh, bisa berubah mengikuti implementasi nyata):
  - `GET /profile/me` → mengembalikan status club & usia/role yang relevan untuk consent.
  - `GET /clubs/join-status` → status join request aktif (jika ada).
  - `POST /clubs/join` → membuat join request (menghormati aturan consent).

### Data & Rules
- Gunakan SQLite dev (`schema.dev.prisma`) untuk iterasi cepat.
- Pastikan model yang menyangkut:
  - relasi user–club
  - relasi parent–child
  - flag consent
  konsisten antara schema, seed, dan API.

---

## ✅ Definition of Done (Phase)

Phase **Membership & Governance Foundation** dianggap selesai ketika:

1. Athlete baru bisa registrasi dan masuk ke sistem dengan status membership yang jelas.
2. User tanpa club **selalu** melihat indikator/alert "Belum tergabung club" di Dashboard.
3. Alur join club (request → approval/reject) berjalan end-to-end di UI + API.
4. Untuk user <18 tahun, minimal satu alur kritikal (mis. join club) sudah terlindungi oleh mekanisme Parental Consent.
5. TSC / build checks lulus untuk client & server pada jalur kode yang tersentuh.

---

*Last Updated: 2026-02-04 (Pivot to Membership & Governance Foundation)*
