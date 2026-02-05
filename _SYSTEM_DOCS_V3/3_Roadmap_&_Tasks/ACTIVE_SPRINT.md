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

| T01 | **Doc Consolidation**: Move all .md files to _SYSTEM_DOCS_V3 hierarchy | Docs | ✅ COMPLETE |
| T02 | **Standard Creds Reset**: Secure superadmin admin@sip.id with blueprint password | Auth | ✅ COMPLETE |
| T03 | **Protocol Sync**: Update workflows/sync/endsession to new V3 paths | Agent | ✅ COMPLETE |
| T04 | **Local Connectivity**: Fix ERR_CONNECTION_REFUSED via IPv4 & Proxy config | Dev | ✅ COMPLETE |
| P04 | **Production Login Stability**: Debug persistent login failure (FIXED in LoginPage) | Backend | ✅ COMPLETE |
| P05 | **Parent Data Persistence Feedback**: Verified & added UI indicators for WhatsApp flow | Frontend | ✅ COMPLETE |
| P06 | **Athlete Club Clear-out**: Scripted reset of Andi Pranata for E2E testing | Backend | ✅ COMPLETE |

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
