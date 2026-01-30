# Corelink SIP (Sistem Integrasi Panahan)
**The Digital Ecosystem for Archery.**
Platform Modular Monolith yang menghubungkan Organisasi (Perpani/Club) dengan Individu (Atlet/Coach) dalam satu ekosistem terintegrasi.

## 📜 Documentation Map
Agar tidak bingung, gunakan peta dokumen di bawah ini:
*   [**BLUEPRINT_V2.md**](file:///d:/G.Antigravity/sip-api/BLUEPRINT_V2.md): Kitab Suci Arsitektur. Berisi detail Role Codes, Database Map, dan Aturan Coding.
*   [**Memory Bank**](file:///d:/G.Antigravity/sip-api/memory-bank/): Konteks aktif proyek (Apa yang sedang dikerjakan sekarang).
*   [**TROUBLESHOOT.md**](file:///d:/G.Antigravity/sip-api/docs/troubleshoot.md): Log error dan solusinya.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker Desktop

### 1. Start Database
**Option A: Docker (PostgreSQL)**
```bash
cd server
docker-compose up -d
```

**Option B: Local (SQLite)**
1. Update `server/.env` to use `DATABASE_URL="file:./dev.db"`
2. Run setup:
```bash
cd server
npm run db:setup:local
```

### 2. Setup Backend
```bash
cd server
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

### 3. Setup Frontend
```bash
cd client
npm install
npm run dev
```

### 4. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

---

## 🔑 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@sip.id | c0r3@link001 |
| Perpani | perpani@perpani.or.id | perpani123 |
| Club | owner@archeryclub.id | clubowner123 |
| Athlete | andi@athlete.id | athlete123 |
| Coach | coach@archeryclub.id | coach123 |

> [!TIP]
> Daftar lengkap kredensial dan role dapat dilihat di [**BLUEPRINT_V2.md**](file:///d:/G.Antigravity/sip-api/BLUEPRINT_V2.md).

---

## 🛠️ Common Commands

### Database (Prisma)
```bash
# Generate Client
npx prisma generate

# Push Changes
npx prisma db push

# Studio
npx prisma studio
```

### Verification
```bash
# Run Lint Protocol
/lint-protocol
```

---

## 📝 License
MIT © 2026 Antigravity
