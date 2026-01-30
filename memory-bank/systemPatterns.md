# System Patterns: Corelink SIP

## 🎨 Design Language: "Unified Pro Glass"
Semua UI di Corelink SIP harus mengikuti standar estetika ini agar terlihat premium dan state-of-the-art:

1.  **Surfaces**: Gunakan `glass` class. Kombinasi `bg-dark-950/60` dengan `backdrop-blur-3xl`.
2.  **Borders**: Gunakan `border-white/5` atau `border-white/10`. Berikan `rounded-2xl` atau `rounded-[2rem]` untuk kesan modern.
3.  **Typography**: Gunakan `SIPText` component untuk branding. Judul utama harus menggunakan font display dengan tracking yang lebar.
4.  **Color Palette**:
    *   **Primary**: Cyan-400 ke Blue-600 (Gradients).
    *   **Accent**: Amber-400 (untuk highlight 'SIP').
    *   **Danger**: Red-500/20 (dengan red-400 text).
5.  **Interactive**: Hover effect harus transformatif (e.g., `hover:-translate-y-1`, `hover:scale-[1.02]`).

## 🏗️ Architecture: Modular Galaxy
*   **Mirroring**: Folder `client/src/modules/X` harus bercermin ke `server/src/modules/X`.
*   **Isolation**: Modul `athlete` tidak boleh tau ada modul `club`. Komunikasi hanya lewat `core` atau database.
*   **Permissions**: Sidebar dikontrol oleh `permissions.ts` dan backend config, bukan hardcoded di UI.

## 🚀 Optimization
*   **PWA**: Selalu perhatikan PWA Manifest dan loading states (`PWALoadingScreen`).
*   **Idempotency**: Semua script migrasi/seed harus aman dijalankan berkali-kali.
