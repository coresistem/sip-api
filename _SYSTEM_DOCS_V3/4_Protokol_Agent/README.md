# 🌳 Corelink SIP

**The Archery Ecosystem Platform** — Built on Csystem Engine

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/[your-repo]/sip.git
cd sip

# Install dependencies
npm install
cd client && npm install
cd ../server && npm install

# Setup database
cd server
npx prisma generate
npx prisma migrate dev

# Start development
# Terminal 1 (Server)
cd server && npm run dev

# Terminal 2 (Client)
cd client && npm run dev
```

**Login:** `admin@sip.id` / `c0r3@link001`

---

## 📚 Documentation

**Start Here:** [`DOCS_HUB.md`](DOCS_HUB.md) — The Single Source of Truth

| Document | Purpose |
|----------|---------|
| [DOCS_HUB.md](DOCS_HUB.md) | Entry point for all documentation |
| [VISION/GENESIS.md](VISION/GENESIS.md) | Philosophy & Business Model |
| [VISION/BLUEPRINT.md](VISION/BLUEPRINT.md) | Architecture & Tech Rules |
| [ROADMAP/MASTER_CHECKLIST.md](ROADMAP/MASTER_CHECKLIST.md) | Complete Feature Checklist |
| [ROADMAP/CURRENT_PHASE.md](ROADMAP/CURRENT_PHASE.md) | What We're Building Now |

### 📋 Quick Reference (Reminder)

| Dokumen | Fungsi | Kapan Dibaca |
|---------|--------|--------------|
| **`DOCS_HUB.md`** | 🚪 Pintu masuk, overview struktur | **Pertama kali** |
| `VISION/GENESIS.md` | Filosofi Csystem, Business Model | Saat butuh "Why" |
| `VISION/BLUEPRINT.md` | Aturan teknis, Tech Stack | Saat butuh "How" |
| `ROADMAP/MASTER_CHECKLIST.md` | Status lengkap tree (Roots→Fruit) | Saat butuh "Overall Progress" |
| `ROADMAP/CURRENT_PHASE.md` | Fokus pembangunan saat ini | **Setiap session** |
| `TASKS/ACTIVE_SPRINT.md` | Task yang sedang dikerjakan | **Setiap session** |
| `TASKS/BACKLOG.md` | Task di masa depan (prioritized) | Saat planning |
| `LABS/REGISTRY.md` | Daftar fitur eksperimental | Saat mau explore "wow" features |
| `LOGS/DECISIONS.md` | Keputusan arsitektur | Saat butuh konteks keputusan |
| `LOGS/PROGRESS.md` | Milestone yang sudah selesai | Saat butuh history |

---

## 🤖 For AI Agents

**Mandatory First Action:**
```
@sync
```

**Available Protocols:**
| Command | Purpose |
|---------|---------|
| `@sync` | Session start - load context |
| `@snag` | Problem escalation - find solution |
| `@endsession` | Clean exit - update docs |
| `/lint-protocol` | Build verification |

---

## 🏗️ Tech Stack

- **Frontend:** Vite + React + TypeScript + Tailwind
- **Backend:** Express + Node.js + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Deploy:** Render.com

---

## 📂 Project Structure

```
sip/
├── DOCS_HUB.md          # 📌 START HERE
├── VISION/              # Philosophy docs
├── ROADMAP/             # Planning docs
├── TASKS/               # Execution docs
├── LABS/                # Experiments
├── LOGS/                # History
├── .agent/              # Agent tools & skills
├── client/              # React Frontend
├── server/              # Express Backend
└── _archive/memory-bank/ # Legacy context (deprecated, read-only)
```

---

## 📝 License

Private — Coach RE / Csystem

---

*"Connecting the Core of Sports Ecosystem"*
