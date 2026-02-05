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


**MANDATORY START POINT:**
Semua dokumentasi strategis kini dipusatkan di folder:
👉 [`_SYSTEM_DOCS_V3/`](_SYSTEM_DOCS_V3/)

Agent HARUS membaca [`_SYSTEM_DOCS_V3/ARCHITECT_TRANSITION_V3.md`](_SYSTEM_DOCS_V3/ARCHITECT_TRANSITION_V3.md) sebelum memulai pekerjaan teknis apa pun.

---

## 📚 Documentation structure (V3 Transition)

| Category | Folder | Purpose |
|----------|--------|---------|
| **Core Transition** | [`_SYSTEM_DOCS_V3/`](_SYSTEM_DOCS_V3/) | **Main Entry Point** |
| 1️⃣ Visi & Filosofi | `_SYSTEM_DOCS_V3/1_Visi_&_Filosofi/` | Philosophy & Blueprint (Static) |
| 2️⃣ Track Record | `_SYSTEM_DOCS_V3/2_Track_Record/` | History & Decision Logs |
| 3️⃣ Roadmap & Tasks | `_SYSTEM_DOCS_V3/3_Roadmap_&_Tasks/` | Dynamic Planning & Sprint |
| 4️⃣ Protokol Agent | `_SYSTEM_DOCS_V3/4_Protokol_Agent/` | AI Protocols & Registry |

---

## 🤖 For AI Agents

**Mandatory First Action:**
```
@sync
```

**Transition Protocol:**
Selama masa transisi Arsitektur Core-First, Agent dilarang memodifikasi modul `plugins` sebelum infrastruktur `core` (Auth & Profile) mencapai stabilitas 100%.

---

## 📂 Project Structure

```
sip/
├── _SYSTEM_DOCS_V3/     # 📌 ALL DOCS START HERE (Transition V3)
├── client/              # React Frontend
├── server/              # Express Backend
├── .agent/              # Agent tools & skills
└── (Legacy Folders: VISION, ROADMAP, TASKS, LOGS, LABS - DO NOT USE)
```

---

## 📝 License

Private — Coach RE / Csystem

---

*"Connecting the Core of Sports Ecosystem"*
