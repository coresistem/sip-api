# 🏛️ CSYSTEM GENESIS: Grand Design & Philosophy
**"Connecting the Core of Sports Ecosystem"**
**Version:** 2.0 (Consolidated from The Genesis & BLUEPRINT)
**Author:** Coach RE

---

## 1. VISI & FILOSOFI DASAR 👁️

### 1.1 The Identity: CORE = Coach RE
Corelink bukan sekadar aplikasi, tapi manifestasi dari pengalaman lapangan (Coach) yang dituangkan menjadi kode.
- **Spirit:** Pragmatisme Pelatih (Hasil nyata) + Idealisme Arsitek (Data terintegrasi).
- **Posisi:** **Independent SaaS (Software as a Service)**.
    - *Mengapa?* Menghindari siklus politik kepengurusan Cabor. Data atlet abadi, tidak tergantung siapa Ketua Umumnya.
    - *Analogi:* Corelink adalah "PLN"-nya olahraga. Siapapun pemerintahnya, listriknya tetap pakai Corelink.

### 1.2 The Core Dynamic
- **Jantung (The Heart):** **EVENT.** Tempat semua role berkumpul (Atlet, Coach, Wasit, Vendor, Tukang Ojek).
- **Pintu Gerbang (The Gateway):** **CLUB.** Tempat user bernaung sehari-hari dan sumber pendapatan rutin (*Recurring Revenue*).

---

## 2. ARSITEKTUR SISTEM: THE GENESIS TREE 🌳

Corelink SIP adalah **"The Corelink Genesis Tree"**—architectural root connecting the entire ecosystem.

### 2.1 The Four Parts of The Tree

| Part | Analogy | Focus | Status |
|------|---------|-------|--------|
| **🌱 ROOTS** | Akar | Identity (CoreID), Auth, Database Schema | ✅ COMPLETE |
| **🪵 TRUNK** | Batang | API Server, Client Modules (Mirroring) | ✅ STABLE |
| **🌿 BRANCHES** | Dahan | 9 Life-Roles (Club, Athlete, Coach, etc.) | 🔄 EXPANDING |
| **🍎 FRUIT** | Buah | Economic Engine (CorePoints, Revenue) | ⬜ PLANNED |

### 2.2 Identity Layer: CoreID
Satu akun tunggal (Single Sign-On) untuk seumur hidup.
- Format: `XX.XXXX.XXXX` (Role.Location.Sequence)
- Digunakan untuk Login Klub, Daftar Lomba, Belanja Alat, hingga Cek Sertifikat.
- Data profil melekat pada User, bukan pada organisasi.

### 2.3 The 9 Life-Roles

| Code | Role | Description |
|------|------|-------------|
| 00 | SUPER_ADMIN | God Mode |
| 01 | PERPANI | Federation |
| 02 | CLUB | Organization |
| 03 | SCHOOL | Educational Partner |
| 04 | ATHLETE | The Player |
| 05 | PARENT | Guardian |
| 06 | COACH | Trainer |
| 07 | JUDGE | Official |
| 08 | EO | Event Organizer |
| 09 | SUPPLIER | Vendor |
| 10 | MANPOWER | Support Worker |

---

## 3. CORE PHILOSOPHIES 📜

1. **Modular Monolith**: Logically separated by domains but lives in one repository.
2. **Root Identity**: Biological data belongs to `User` model (Single Source of Truth).
3. **The Handshake Protocol**: All cross-entity relations follow "Proposed → Verified" flow.
4. **Innovation Lab (The Nursery)**: Experimental features isolated in `LABS/` until stable.
5. **Verification over Automation**: Manual verification for high-stakes data.
6. **WhatsApp-First UX**: Prioritize WhatsApp over Email.

---

## 4. BUSINESS MODEL 💰

### 4.1 Revenue Streams

| Timeline | Stream | Description |
|----------|--------|-------------|
| **Short** | SaaS Subscription | Klub bayar bulanan untuk Manajemen & WA Blast |
| **Mid** | Transaction Fee | % dari tiket lomba & marketplace |
| **Long** | Big Data & Sponsorship | Insight data ke brand & sponsor event |

### 4.2 User Tiering Strategy (The Hook)

| Level | Status | Features | Data Required |
|-------|--------|----------|---------------|
| Newbie | Free | Info Lomba, Berita | Email & HP |
| New Entry | Club Member | Absensi, Tagihan WA | + DOB, Sekolah |
| Intermediate | Event Ready | Daftar Lomba, Sertifikat | + KTP/KK (Validated) |
| Advance | Pro | Video Analysis, Sponsor Portfolio | + Data Fisik & Alat |

---

## 5. TERMINOLOGY RULES ⚠️

| ❌ BANNED | ✅ USE |
|-----------|--------|
| Staff | **Manpower** |
| sipId | **coreId** |
| SIP ID | **CoreID** |

---

**PENUTUP:**
Impian besar integrasi olahraga Indonesia dimulai dari satu baris kode `git commit` hari ini.
**Corelink adalah Legacy. Coach RE adalah Arsiteknya.**

*Dokumen ini adalah hasil konsolidasi dari `Experiment/2026-01 The Genesis.md` dan bagian filosofi dari `BLUEPRINT_V2.md`.*
