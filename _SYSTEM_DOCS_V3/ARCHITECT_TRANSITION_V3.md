# 🎯 ARCHITECTURAL TRANSITION V3: Core-First Plugin System

## 🏛️ PENDAHULUAN
Dokumen ini adalah instruksi strategis untuk masa transisi **Corelink SIP** dari *Modular Monolith* tradisional menuju **Core-First Plugin Architecture**. Keputusan ini diambil untuk mengeliminasi kompleksitas teknis yang sering menyebabkan hambatan operasional dan mempersiapkan sistem untuk model fitur berbasis subskripsi (SaaS).

## 🧭 TUJUAN UTAMA
1.  **System Purity**: Menjadikan pondasi sistem (Akar) sangat lean dan stabil.
2.  **Plugin Runtime**: Semua fitur non-vital (Event, Commerce, dll) harus bersifat add-on/plugin.
3.  **Core Priority**: Menyelesaikan masalah login, registrasi, dan identitas sebelum menyentuh fitur lain.

## 🏹 DEFINISI STRUKTUR (V3)
### 1. The Roots (Akar - Wajib Ada)
- **Auth Service**: Login, Register, Refresh Token.
- **Role/RBAC**: Penentuan hak akses user.
- **Core Identity**: NIK, Profil Dasar, WhatsApp, Lokasi.
- **Module Loader**: Sistem yang membaca modul aktif.
- **Hexagonal Architecture**: Core services menggunakan **Ports & Adapters**. Logika bisnis inti tidak boleh bergantung langsung pada Prisma atau Express.

### 2. The Trunk (Batang/Sistem Plugin)
- Lokasi Modul: `src/plugins/` (Server) & `src/modules/plugins/` (Client).
- Plugin hanya dimuat jika diaktifkan via database atau konfigurasi subskripsi.

### 3. The Fruit (Buah - Add-on)
- **Modul Panahan**: Scoring, Bracket, Category.
- **Modul Bisnis**: Financial, Inventory, Jersey Marketplace.
- **Modul Governance**: Certificate, School, Member Management.

## 🛡️ PROTOKOL TRANSISI (Instruksi Agent)
1.  **Read Order**: Agent HARUS mulai membaca dari folder `_SYSTEM_DOCS_V3/` untuk memahami konteks transisi sebelum menyentuh file lainnya.
2.  **Strict Isolation**: Dilarang mengimpor fungsi dari folder `plugins` ke dalam `core`. Hubungan hanya boleh searah: Plugin mengimpor dari Core.
3.  **Minimalist Infrastructure**: Hapus/Komentari semua rute non-vital di `server/src/index.ts` untuk tujuan debugging cepat hingga Core stabil.

## ✅ DEFINITION OF DONE (V3 FOUNDATION)
Sistem dianggap stabil jika:
- Seeder Core berjalan sempurna di Lokal & Render.
- Login Super Admin (Blueprint) tidak pernah gagal.
- Registrasi Athlete & Parent berjalan mulus dengan auto-discovery.

---
**Lead Architect**: Agent Antigravity (v4.8.0 Enterprise)
**Status**: IN TRANSITION 🟢
