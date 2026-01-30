---
description: Protokol Verifikasi Kode & Linting untuk SIP-API
---

# 🛡️ Linting & Verification Protocol

Protokol ini Wajib diikuti oleh Agent sebelum menyatakan tugas "Selesai" untuk menjaga integritas codebase **SIP-API**.

## 1. Trigger Verifikasi
Lakukan langkah di bawah ini setiap kali:
- Modifikasi file `.ts` atau `.tsx`.
- Perubahan pada `prisma/schema.prisma`.
- Refactor struktur folder atau penggantian nama file.
- Penambahan dependency baru.

## 2. Langkah Verifikasi Server
// turbo
1. Masuk ke direktori `server/`.
2. Jalankan Type Check:
   ```bash
   .\node_modules\.bin\tsc.cmd --noEmit --skipLibCheck
   ```
3. Jika ada perubahan Prisma Schema, regenerasi client:
   ```bash
   .\node_modules\.bin\prisma.cmd generate
   ```

## 3. Langkah Verifikasi Client
// turbo
1. Masuk ke direktori `client/`.
2. Jalankan Type Check:
   ```bash
   .\node_modules\.bin\tsc.cmd --noEmit --skipLibCheck
   ```

## 4. Troubleshooting Umum
Jika terjadi error "Module Not Found" atau "Property X does not exist":
- **Prisma Cache**: Hapus `node_modules/.prisma` dan jalankan `prisma generate` ulang.
- **Relative Paths**: Cek kedalaman path (e.g., `../../` vs `../../../`) terutama setelah pemindahan file antar module.
- **Extension**: Pastikan import menggunakan `.js` di Server (CommonJS) dan tidak menggunakan extension di Client (Vite).

## 5. Ketentuan "DONE"
Agent baru boleh memanggil `notify_user` jika:
1. `tsc` di Server mengembalikan Exit Code 0.
2. `tsc` di Client mengembalikan Exit Code 0.
3. Walkthrough telah mencantumkan hasil verifikasi otomatis ini.
