---
description: Prosedur sinkronisasi antara PC Utama dan Lapie agar tidak ada konflik kode atau memory bank.
---

# 🔄 WORKFLOW: CORE-LAPIE SYNC

Gunakan workflow ini (`/sync`) setiap kali Anda berpindah perangkat untuk memastikan Si Anti memiliki context yang sama tanpa perlu copy-paste manual.

### ⬆️ DI PERANGKAT SAAT INI (PC atau Lapie sebelum ditinggalkan)
1. **Verifikasi Otak**: Pastikan Si Anti sudah mengupdate memori:
   > "Anti, update `memory-bank/` agar mencerminkan progres terakhir."
2. **End-Session & Push**:
// turbo
   ```powershell
   # Pastikan git menggunakan path yang benar (jika di PC)
   git add .
   git commit -m "End Session: Auto-sync progress for [Device Name]"
   git push origin main
   ```

### ⬇️ DI PERANGKAT TUJUAN (Saat baru mulai di Laptop/PC baru)
// turbo
1. **Tarik Kode & Memori Terbaru**:
   ```powershell
   git pull origin main
   # Penting: Update atau unduh 771+ Agent Skills terbaru
   git submodule update --init --recursive
   ```
2. **Pemanasan Agent (MANDATORY)**: Masukkan perintah ini di chat Antigravity:
   > "Jalankan Protokol Bootup dari `.clinerules`. Baca `memory-bank/` dan `BLUEPRINT_V2.md`. Laporkan status terakhir proyek dan apa tugas kita sekarang."

3. **Cek Kesiapan Environment**:
   ```powershell
   # Install jika ada depedensi baru
   npm install
   # Generate Prisma client agar sinkron dengan schema terbaru
   cd server; npx prisma generate
   ```

---
*Catatan: Folder `.agent`, `.agents`, `docs`, dan `memory-bank` semuanya sudah diatur untuk ikut tersinkronisasi via Git.*
