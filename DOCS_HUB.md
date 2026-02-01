# 🌳 CSYSTEM DOCUMENTATION HUB
**"The Single Source of Truth for Coach RE & All Agents"**
**Last Updated:** 2026-01-31 21:30 WIB

---

## 🚀 QUICK START FOR NEW AGENTS

**MANDATORY FIRST ACTION:**
```
@sync
```
This command activates the full onboarding protocol. See `.agent/workflows/sync.md`.

---

## 📂 DOCUMENTATION STRUCTURE

```
sip/
├── 🎯 DOCS_HUB.md              ← YOU ARE HERE (Start Point)
│
├── 📜 VISION/                   ← "Why" Documents (Immutable)
│   ├── GENESIS.md              ← Grand Design: Csystem Philosophy
│   └── BLUEPRINT.md            ← Architecture Rules & Tech Stack
│
├── 🗺️ ROADMAP/                  ← "What" Documents (Master Plan)
│   ├── MASTER_CHECKLIST.md     ← THE ONE CHECKLIST (Roots→Fruit)
│   └── CURRENT_PHASE.md        ← What We're Building Now
│
├── 📋 TASKS/                    ← "How" Documents (Execution)
│   ├── ACTIVE_SPRINT.md        ← Current Work Items
│   └── BACKLOG.md              ← Future Items (Prioritized)
│
├── 🧪 LABS/                     ← "Experiments" (The Nursery)
│   ├── REGISTRY.md             ← All Experiments Catalog
│   └── [feature]/              ← Standalone Feature Folders
│
├── 📝 LOGS/                     ← "History" Documents
│   ├── DECISIONS.md            ← Architecture Decision Records
│   └── PROGRESS.md             ← Completed Milestones
│
└── 🔧 .agent/                   ← Agent Tools
    ├── workflows/              ← Protocols (@sync, @snag, @endsession)
    ├── personas/               ← Role Definitions (architect, backend, frontend)
    └── skills/                 ← Capabilities Library (2600+ skills)
```

---

## 📖 DOCUMENT HIERARCHY (Read Order)

### For First-Time Context (Full Onboarding)
1. `DOCS_HUB.md` (This file) - 2 min
2. `VISION/GENESIS.md` - 3 min (Why Csystem exists)
3. `ROADMAP/MASTER_CHECKLIST.md` - 3 min (Where we are)
4. `ROADMAP/CURRENT_PHASE.md` - 2 min (What's active)

**Total: ~10 min** (vs. previous 20-40 min)

### For Returning Sessions (@sync)
1. `ROADMAP/CURRENT_PHASE.md` - 2 min
2. `TASKS/ACTIVE_SPRINT.md` - 2 min

**Total: ~4 min**

---

## 🔄 SESSION PROTOCOLS

### @sync (Session Start)
**Trigger:** Start of any session or device switch
**Action:** See `.agent/workflows/sync.md`
**Output:** Agent provides Status Dashboard

### @snag (Problem Escalation)
**Trigger:** Same error persists after 2-3 attempts
**Action:** See `.agent/workflows/snag.md`
**Output:** Agent searches skills library for solution

### @endsession (Clean Exit)
**Trigger:** End of session
**Action:** See `.agent/workflows/endsession.md`
**Output:** All docs updated, Git pushed

---

## 🔗 QUICK LINKS

| Category | Document | Purpose |
|----------|----------|---------|
| **Vision** | [GENESIS.md](VISION/GENESIS.md) | Philosophy & Business Model |
| **Architecture** | [BLUEPRINT.md](VISION/BLUEPRINT.md) | Tech Stack & Module Rules |
| **Progress** | [MASTER_CHECKLIST.md](ROADMAP/MASTER_CHECKLIST.md) | Full Tree Status |
| **Current** | [CURRENT_PHASE.md](ROADMAP/CURRENT_PHASE.md) | Active Focus |
| **Labs** | [REGISTRY.md](LABS/REGISTRY.md) | Experimental Features |

---

## 📱 CROSS-DEVICE PROTOCOL

### Before Leaving (PC or Laptop)
```bash
@endsession
git add . && git commit -m "sync: [brief description]" && git push
```

### When Arriving (New Device)
```bash
git pull && git submodule update --init --recursive
cd server && npx prisma generate
```
Then run `@sync` in chat.

---

**Remember:** If this document doesn't answer your question, check `VISION/BLUEPRINT.md` for architecture rules.
