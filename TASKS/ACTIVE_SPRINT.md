# 📋 ACTIVE SPRINT
**Sprint:** Membership & Governance Foundation – Sprint 1  
**Duration:** 2026-02-04 to 2026-02-18  
**Owner:** Agent Team (guided by Pak Mentor)

---

## 🎯 Sprint Goal
Integrasi UI **"Club Not Assigned"** dan **logic Parent–Child** sehingga state Membership user selalu jelas dan konsisten di Dashboard.

---

## Tasks

### ⬜ Active Tasks (In Scope Sekarang)

| ID | Task | Area | Status |
|----|------|------|--------|
| P01 | **Parent Deep Link & Linking**: Stabilisasi alur pendaftaran ortu via link khusus atlet | Frontend | ✅ COMPLETE |
| P02 | **WhatsApp Auto-Discovery**: Backend logic untuk otomatis hubungkan Parent & Child via WhatsApp | Backend | 🚧 IN PROGRESS |
| P03 | **Profile Save Sync**: Ensure Athlete profile saves Parent Name/WA before sending WA Invitation | Frontend | 🚧 IN PROGRESS |
| M01 | Backend: API untuk check status club user (NO_CLUB / PENDING / MEMBER / LEFT) | Backend | ⬜ Not Started |
| M02 | Frontend: Alert Warning di Dashboard jika Club = Null / NO_CLUB | Frontend | ⬜ Not Started |
| M03 | Frontend: Modal Popup "Join Club" (trigger dari alert + menu) | Frontend | ⬜ Not Started |

Catatan Implementasi:
- M01 harus mengembalikan struktur yang simpel & future-proof (bisa dipakai modul lain tanpa breaking).
- M02 wajib muncul di Dashboard utama athlete/parent ketika status club tidak jelas.
- M03 minimal mendukung: pilih club + kirim join request; detail lanjutan bisa di iterasi berikutnya.

---

### ⏭️ Next Up

- **N01 – Dashboard Hub Migration**  
  Mengintegrasikan peringatan "Belum Ada Club" ke semua role yang relevan.

---

### 🧾 Parking Lot (Dipause / Nunggu Sesudah Sprint Ini)

- Penambahan fitur baru di Event Management.
- Iterasi lanjut Club Finance / auto-billing.

---

*Last Updated: 2026-02-04 (Pivot to Membership & Governance Foundation – Sprint 1)*
