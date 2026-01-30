---
description: Prosedur sinkronisasi antara PC Utama dan Lapie agar tidak ada konflik kode atau memory bank.
---

# 🔄 WORKFLOW: CORE-LAPIE SYNC

Gunakan workflow ini setiap kali Anda berpindah perangkat untuk memastikan Si Anti memiliki context yang sama.

### ⬆️ DI PERANGKAT SAAT INI (Sebelum Selesai)
1. Cek status file: `git status`
2. Update Memory Bank: Beri tahu Si Anti untuk `@update memory bank` agar `activeContext.md` mencerminkan progres terakhir ke detik ini.
// turbo
3. **Push ke Cloud**: 
   ```powershell
   git add .
   git commit -m "Sync: Progress update from [Device Name]"
   git push origin main
   ```

### ⬇️ DI PERANGKAT TUJUAN (Saat Baru Bangun)
1. **Tarik Kode Terbaru**:
   ```powershell
   git pull origin main
   ```
2. **Pemanasan Agent**: Ketik ini di chat:
   > "Cek protokol bootup di `.clinerules`. Baca `memory-bank/` dan beri tahu aku apa yang harus kita kerjakan sekarang sesuai `activeContext.md`."
3. **Cek Depedensi**:
   ```powershell
   npm install
   ```

---
*Catatan: Pastikan `.env` sudah dicopy secara manual jika ada perubahan variable environment.*
