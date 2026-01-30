@architect @frontend @backend

🔴 END OF SESSION PROTOCOL - DO NOT SKIP STEPS.

Kita akan mengakhiri sesi coding. Lakukan prosedur penutupan berikut secara berurutan:

1. **TECHNICAL MEMORY BANK SYNC:**
   - Gunakan folder `memory-bank/` sebagai kebenaran tunggal (Single Source of Truth).
   - Update `activeContext.md`, `progress.md`, `systemPatterns.md`, dan `decisionLog.md`.
   - Pastikan status terakhir debugging (termasuk Error 500 atau EPERM) tercatat dengan jelas di `activeContext.md`.

2. **SKILLS & HANDOVER PROMPT:**
   - **WAJIB**: Update `memory-bank/handover.md` dengan "Ultimate Starter Prompt".
   - Masukkan instruksi eksplisit agar agen berikutnya menggunakan `.agent/skills/` (prisma-expert, error-detective, dll).
   - Berikan ringkasan "Next Steps" yang sangat spesifik.

3. **SYNC VERIFICATION & GIT PUSH:**
   - Jalankan `git add .`.
   - Lakukan `git commit -m "End Session: Syncing [Memory Bank + Skills + Docs] for Corelink SIP"`.
   - Lakukan `git push origin main`.
   - Pastikan file `.clinerules`, `BLUEPRINT_V2.md`, folder `.agent`, dan `memory-bank/` ikut ter-push.

4. **FINAL SUMMARY:**
   - Berikan laporan penutup singkat di chat mengenai RESTORE POINT yang sudah dibuat.

Jadikan ini Restore Point yang valid untuk perpindahan antar perangkat (Main PC ↔ Lapie).
@architect @frontend @backend
