Markdown
# 🏛️ SIP ARCHITECTURE BLUEPRINT V2.0
> **Codename:** "Corelink SIP" (Modular Monolith)
> **Stack:** Vite (React) + Express (Node.js) + Prisma (PostgreSQL)
> **Last Updated:** Jan 2026

---

## 1. 🌟 CORE PHILOSOPHY
SIP dibangun dengan arsitektur **Modular Monolith**.
Aplikasi dibagi menjadi "Negara-Negara Bagian" (Modules) yang terpisah secara logis namun berada dalam satu repositori (Monorepo-style).

### The Golden Rules for AI Agents:
1.  **Context Isolation:** Saat mengerjakan fitur "Athlete", JANGAN membaca atau menyentuh folder "Club". Fokus hanya pada modul yang diminta.
2.  **Core Dependency:** Modul boleh mengimpor dari `core` (shared), tapi DILARANG saling mengimpor antar modul domain (misal: `athlete` import `club` = FORBIDDEN).
3.  **Atomic Commits:** Satu fitur = Satu Commit. Jangan menggabungkan perbaikan UI dan Backend dalam satu commit besar.

## 1.1. 🎭 ROLE ARCHITECTURE (THE CORELINK)
SIP menggunakan sistem "Single User, Multiple Profiles".
User login satu kali, tapi bisa memiliki peran berbeda.

**Role Codes:**
- **ORGANIZATION:** 01:PERPANI, 02:CLUB, 03:SCHOOL, 08:EO, 09:SUPPLIER
- **INDIVIDUAL:** 04:ATHLETE, 05:PARENT, 06:COACH, 07:JUDGE, 00:SUPER_ADMIN
- **SUPPORT:** 10:MANPOWER (Staff with SIP Access)

**Integration Flow (The Handshake):**
Semua relasi antar entitas (misal: Atlet -> Klub) bersifat "Proposed" sampai di-"Verify" oleh Organisasi terkait.
- One Coach can join Multiple Clubs (Many-to-Many).
- One Parent can manage Multiple Athletes.
---

## 2. 🗺️ DOMAIN MAP & RESPONSIBILITIES
Pembagian wilayah berdasarkan `schema.prisma`:

### 🟢 MODULE: CORE (The Foundation)
*Bertanggung jawab atas infrastruktur, autentikasi, dan UI global.*
* **Database Models:** `User`, `Account`, `Session`, `VerificationToken`.
* **Key Features:** Login, Register, Forgot Password, Navbar, Sidebar, File Upload, RBAC (Role Based Access Control).
* **Location:** `src/modules/core`

### 🏹 MODULE: ATHLETE (The Player)
*Bertanggung jawab atas pengembangan individu atlet.*
* **Database Models:** `Athlete`, `PhysicalTracking`, `Score`, `UserEquipment`.
* **Key Features:** Dashboard Atlet, Input Skor Latihan, Grafik Performa Fisik, Manajemen Alat.
* **Location:** `src/modules/athlete`

### 🏢 MODULE: CLUB (The Organizer)
*Bertanggung jawab atas manajemen organisasi.*
* **Database Models:** `Club`, `ClubMember`, `Manpower`, `Certificate`.
* **Key Features:** Approval Member, Manajemen Staff/Manpower, Keuangan Klub, Inventaris.
* **Location:** `src/modules/club`

### 🏆 MODULE: EVENT (The Competition)
*Bertanggung jawab atas penyelenggaraan lomba.*
* **Database Models:** `CompetitionSeries`, `Competition`, `CompetitionCategory`.
* **Key Features:** Pendaftaran Lomba, Bagan Pertandingan, Live Score.
* **Location:** `src/modules/event`

**Coach & Manpower Policy:**
- **Exclusivity:** A User with Role `COACH` (06) can only be linked to **ONE Primary Club**.
- **Secondary Jobs:** If a Coach works at another Club, they must be added as `MANPOWER` (10) by that Club, with a specific position (e.g., "Visiting Coach").
- **Manpower Rights:** Manpower can be granted specific permissions (e.g., Access to Scoring) without changing their main Role.
---

## 3. 📂 DIRECTORY STRUCTURE (Mirroring Pattern)
Struktur Frontend dan Backend dibuat bercermin agar mudah dinavigasi.

### 💻 CLIENT-SIDE (`sip/client`)
Stack: **Vite + React + Tailwind + Shadcn/UI**

```text
src/
├── modules/               <-- MAIN DOMAIN FOLDERS
│   ├── core/
│   │   ├── components/    (ui/, layouts/, navbar/)
│   │   ├── contexts/      (AuthContext.tsx, ThemeContext.tsx)
│   │   └── hooks/         (useAuth, useToast)
│   │
│   ├── athlete/
│   │   ├── components/    (Specific UI: TargetFace, ScoreCard)
│   │   ├── pages/         (DashboardPage, HistoryPage)
│   │   └── routes.tsx     (Route definitions for Athlete)
│   │
│   ├── club/              (Similar structure for Club)
│   └── event/             (Similar structure for Event)
│
├── App.tsx                <-- Main Router (Aggregates all module routes)
└── main.tsx               <-- Entry Point
⚙️ SERVER-SIDE (sip/server)
Stack: Express.js + Prisma

Plaintext
src/
├── modules/
│   ├── core/
│   │   ├── middleware/    (authMiddleware, roleGuard)
│   │   └── services/      (EmailService, S3Service)
│   │
│   ├── athlete/
│   │   ├── athlete.controller.ts  (Req/Res Handler)
│   │   ├── athlete.service.ts     (Business Logic)
│   │   └── athlete.routes.ts      (Express Router)
│   │
│   └── club/              (Similar structure for Club)
│
├── prisma/
│   └── schema.prisma      <-- SOURCE OF TRUTH
└── index.ts               <-- Main Server Entry
4. 🚀 DEPLOYMENT & DATABASE GUIDELINES
Platform: Render.com

Database: PostgreSQL

Migration Strategy:

Always modify schema.prisma first.

Run npx prisma migrate dev --name <descriptive_name>.

DO NOT manually edit migration SQL unless fixing a specific Render error (e.g., IF EXISTS).

5. ⚠️ KNOWN ISSUES & TROUBLESHOOTING
Render Migration Error: "Index does not exist".

Solution: Use DROP INDEX IF EXISTS in migration files.

Context Window Limit:

Solution: Agents must strictly work within one module folder at a time. Do not load the entire project into context.


"Corelink SIP" ini seperti yang kita bicarakan adalah bangunan Utama yang sudah menyiapkan untuk penghuni Role Codes:
00:SUPER_ADMIN, 01:PERPANI, 02:CLUB, 03:SCHOOL, 04:ATHLETE,05:PARENT, 06:COACH, 07:JUDGE, 08:EO, 09:SUPPLIER
10:MANPOWER (ini untuk penghuni yang tidak mempunyai role diatas sebagai support/punya akses dengan sipId )

Tujuannya corelink adalah penghubung antar role tersebut jadi hanya profile Details.
dengan flow: 
newuser: Onboarding > select role > signup > welcome > Profile Details
existing : Onboarding > Login

signup data (saat ini):
- Full Name (sesuai KK/KTP)
- Email
- Password
- Province-City
- WhatsApp
IRL(in real life)sekarang ini email Jarang dibaca, lebih Utama mengunakan WhatsApp.
saya berencana verifikasi mengunakan WhatsApp yang dikirim oleh system


Profile Details (Organization Role: Perpani, Club, School, Supplier, EO)
- Upload Avatar (profile Pict)
- Organization Logo
- Organization Name
- Organization Description
- Organization Address
- Organization WhatsApp (hotline)
- Organization Instagram
- Organization website
Stucture Organization
- Organization Manpower (CRUD : Position, Name, WhatsApp)
Branch
- Organization Unit (CRUD : Unit Name, Description, Province-City)
Documents
- File Manager 

Profile Details (Individu Role: Athlete, Parent, Coach, Judge)
- Upload Avatar (profile Pict)
- Date of Birth
- Gender
- NIK(Nomor Induk Kependudukan)
- Integration Status: (tergantung dengan role dipilih diawal) 
-- Club > search > Proposed > status (Verified, Pending,..)
-- School > search > Proposed > status (Verified, Pending,..)
-- Perpani > search > Proposed > status (Verified, Pending,..)
-- Athlete > search > Proposed > status (Verified, Pending,..)
catatan: bisa terjadi integrasi lebih dari 1 organisasi, contoh:
Athlete: Club > Perpani
Parent : Athlete > Club
Coach : Club (nah terkadang ada coach yang mengajar lebih dari 1 club)
Judge : Perpani



==============================================================================================================


sip/
├── .clinerules            <-- (WAJIB) Hukum Tertinggi. Si Anti baca ini tiap kali mulai.
├── BLUEPRINT_V2.md        <-- (WAJIB) Kitab Undang-Undang / Peta Arsitektur.
├── PromptSteps.txt        <-- (WAJIB) Skenario / Naskah Drama untuk migrasi ini.
├── README.md              <-- Pintu Masuk Manusia (Update ringkas arahkan ke Blueprint).
│
├── .agents/               <-- (BARU) Lemari Baju / Persona
│   ├── architect.md       <-- Topi Arsitek
│   ├── backend.md         <-- Topi Backend
│   └── frontend.md        <-- Topi Frontend
│
├── memory-bank/           <-- (BARU) Otak Jangka Panjang (Folder, bukan file)
│   ├── productContext.md  <-- Visi Corelink SIP
│   ├── activeContext.md   <-- Apa yang sedang dikerjakan sekarang
│   └── systemPatterns.md  <-- Pola code (React + Express Mirroring)
│
├── docs/                  <-- (RAPIGEN) Pindahkan catatan lama ke sini
│   ├── troubleshooting.md <-- Log error lama
│   └── legacy_notes.md    <-- Catatan lama lain
│
├── client/                <-- Project Frontend
├── server/                <-- Project Backend
└── package.json           <-- Root config
