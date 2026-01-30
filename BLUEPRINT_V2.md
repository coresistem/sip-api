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
4.  **The "Laboratory" Protocol**: Gunakan folder `_labs/` untuk menampung fitur mentah atau eksperimen dari **Si Cantik (AI Studio)**.
5.  **Standalone Sandbox**: Fitur yang butuh ditest publik diletakkan di `client/src/modules/labs/features/`.
    - Route: `/labs/<nama-fitur>` (Public, tidak butuh login).
    - Policy: Si Anti (IDE Agent) bertugas membuat "pintu" (route) tiap kali ada fitur labs baru yang siap ditest publik.
21. **Memory Bank Protocol**: Aktifkan folder `memory-bank/` sebagai "Long-term Memory" antar sesi. Update `activeContext.md` setiap selesai fitur besar.

---

## 1.1. 🔑 TEST CREDENTIALS (FULL LIST)
Gunakan akun di bawah ini untuk pengujian di lingkungan lokal.

| Role | Email | Password | CORE ID (Example) |
|------|-------|----------|-------------------|
| **Super Admin** | `admin@sip.id` | `c0r3@link001` | `00.9999.0001` |
| **Perpani** | `perpani@perpani.or.id` | `perpani123` | `01.9999.0001` |
| **Club** | `owner@archeryclub.id` | `clubowner123` | `02.9999.0001` |
| **School** | `school@sma1.sch.id` | `school123` | `03.9999.0001` |
| **Athlete** | `andi@athlete.id` | `athlete123` | `04.9999.0001` |
| **Parent** | `parent@mail.id` | `parent123` | `05.9999.0001` |
| **Coach** | `coach@archeryclub.id` | `coach123` | `06.9999.0001` |
| **Judge** | `judge@perpani.or.id` | `judge123` | `07.9999.0001` |
| **EO** | `eo@events.id` | `eo123456` | `08.9999.0001` |
| **Supplier** | `supplier@archeryshop.id` | `supplier123` | `09.9999.0001` |
| **Manpower** | `manpower@sip.id` | `manpower123` | `10.9999.0001` |

---

## 1.2. 🎭 ROLE HIERARCHY & PERMISSIONS
SIP menggunakan sistem "Single User, Multiple Profiles".

### Role Codes & CORE ID Format
```
Format: XX.XXXX.XXXX

First 2 digits = Role Code:
├── 00 = SUPER_ADMIN
├── 01 = PERPANI
├── 02 = CLUB
├── 03 = SCHOOL
├── 04 = ATHLETE
├── 05 = PARENT
├── 06 = COACH
├── 07 = JUDGE
├── 08 = EO (Event Organizer)
├── 09 = SUPPLIER
└── 10 = MANPOWER

Middle 4 digits = Province/City Code (BPS) or '9999' for test/dummy location
Last 4 digits = Sequential number
```

### Integration Flow (The Handshake)
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

### 🛒 MODULE: COMMERCE (Csystem Market)
*Bertanggung jawab atas marketplace, jersey, dan inventory supplier.*
* **Database Models:** `Product`, `Order`, `Cart`, `JerseyConfig`.
* **Key Features:** Catalog, Jersey Customization, QC Station, Order Tracking.
* **Location:** `src/modules/commerce`

### 🛡️ MODULE: ADMIN (Super Power)
*Bertanggung jawab atas manajemen sistem tingkat tinggi.*
* **Database Models:** `AuditLog`, `RoleRequest`, `AppModule`.
* **Key Features:** User Management, Role Verification, Module Builder, Perpani Mgmt.
* **Location:** `src/modules/admin`

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
│   │   ├── auth/          (Login, Register, Role Request)
│   │   ├── profile/       (User Profile Details)
│   │   ├── dashboard/     (Standard Dashboard Logic)
│   │   ├── components/    (ui/, layouts/, navbar/)
│   │   ├── contexts/      (AuthContext.tsx, ThemeContext.tsx)
│   │   └── hooks/         (useAuth, useToast)
│   │
│   ├── athlete/
│   │   ├── components/    (Specific UI: TargetFace, ScoreCard)
│   │   ├── pages/         (DashboardPage, HistoryPage)
│   │   └── routes.tsx     (Route definitions for Athlete)
│   │
│   ├── club/
│   │   ├── manpower/      (Coach & Staff mgmt)
│   │   ├── school/        (School program mgmt)
│   │   ├── perpani/       (Regional federation mgmt)
│   │   └── pages/         (ClubDashboard, MembersPage)
│   │
│   ├── event/             (Competition management)
│   ├── commerce/          (Marketplace & Jersey)
│   └── admin/             (Super Admin tools)
│
├── App.tsx                <-- Main Router (Aggregates all module routes)
└── main.tsx               <-- Entry Point
⚙️ SERVER-SIDE (sip/server)
Stack: Express.js + Prisma

Plaintext
src/
├── modules/
│   ├── core/
│   │   ├── auth/          (Auth controller & routes)
│   │   ├── profile/       (Profile storage logic)
│   │   ├── dashboard/     (Dashboard statistics)
│   │   ├── middleware/    (authMiddleware, roleGuard)
│   │   └── services/      (EmailService, S3Service)
│   │
│   ├── athlete/
│   │   ├── athlete.controller.ts
│   │   ├── athlete.service.ts
│   │   └── athlete.routes.ts
│   │
│   ├── club/
│   │   ├── manpower/      (Coach & Staff logic)
│   │   ├── school/        (School sync logic)
│   │   ├── perpani/       (Federation logic)
│   │   └── club.routes.ts
│   │
│   ├── event/             (Scoring & Competition logic)
│   ├── commerce/          (Jersey & Order logic)
│   └── admin/             (System logs & Role mgmt)
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
10:MANPOWER (ini untuk penghuni yang tidak mempunyai role diatas sebagai support/punya akses dengan coreId )

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

### Root Identity Implementation (Applied Jan 2026)
- **Unified Fields**: `dateOfBirth`, `gender`, `nik`, `whatsapp` dipindahkan ke model `User`.
- **Primary Source**: `MasterProfileSection.tsx` adalah satu-satunya sumber pengeditan data identitas biologi.
- **Auto-Calculations**: Umur (Age Category) dihitung secara dinamis dari `dateOfBirth` di level User.



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
