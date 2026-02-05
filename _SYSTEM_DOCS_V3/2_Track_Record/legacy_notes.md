# Legacy Migration & Technical Notes

Dokumen ini mencatat detail teknis transisi dari sistem lama (Old SIP/Legacy) ke arsitektur **Modular Monolith (Corelink SIP)**.

## ✅ Pekerjaan Yang Telah Selesai (Done)

### 1. Fondasi & Identitas (Core)
- **Migrasi sipId → coreId**: Selesai di seluruh DB (Prisma), Server (Express), dan Client (React). Ini adalah fondasi integrasi dengan Corelink Ecosystem.
- **Standarisasi Manpower**: Menghapus istilah "Staff" dan menggantinya dengan "Manpower" sesuai aturan arsitektur Rule 8.
- **Sanitasi Auth**: Memperbaiki `LoginPage.tsx` dan `AuthContext.tsx` agar stabil dan mendukung caching premium.
- **Unified Pro Glass Design**: Implementasi token desain utama pada `index.css` (blur-3xl, dark-950/60).

### 2. Modul Commerce (Marketplace)
- **Restorasi Csystem Market**: Memindahkan logika marketplace lama ke `src/modules/commerce`.
- **UI Cinematic**: Implementasi Hero Banners dan layout responsif untuk katalog produk.

### 3. Infrastruktur & CI/CD
- **PostgreSQL Stability**: Migrasi dari SQLite ke PostgreSQL (Render.com) sudah stabil dengan 100% table keberhasilan.
- **Sync PC-Lapie**: Implementasi workflow `/sync` dan folder `memory-bank/` untuk kolaborasi multi-perangkat.

---

## ⏳ Pekerjaan Yang Masih Tertunda (Pending / In Progress)

### 1. Pembersihan Folder Legacy (Phase 29 Utama)
- **Migrasi Admin**: Halaman manajemen di `_archive/client_src_legacy/pages/admin` belum dipindah ke `src/modules/admin`.
- **Migrasi Finance**: Halaman invoice dan tagihan di folder legacy harus dipindah ke `src/modules/club/features/finance`.
- **Migrasi Inventory**: Halaman stok barang di legacy harus dipindah ke `src/modules/club/features/inventory`.

### 2. Konsolidasi Data
- **Sync Kemendikdasmen**: Integrasi database sekolah nasional untuk pencarian NPSN masih dalam tahap planning (Phase 29-30).
- **Approval System**: Sistem antrean verifikasi NIK dan Dokumen untuk Super Admin belum sepenuhnya diangkut ke UI baru.

### 3. Pembersihan File Sampah
- Menghapus folder `_archive` setelah semua fitur krusial berhasil dimigrasi (Target: Akhir Phase 29).

---

## 📜 Catatan Arsitektur (Konstitusi)
- Semua module baru wajib berada di `client/src/modules/[nama_modul]`.
- Dilarang menggunakan absolute import selain `@/`.
- Gunakan `coreId` sebagai primary identifier untuk entitas organisasi/individu di atas sistem routing.
