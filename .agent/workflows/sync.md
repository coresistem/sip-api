---
description: Protocol untuk Agent baru online - memastikan context lengkap sebelum mulai kerja
---

# 🚀 @SYNC PROTOCOL (Agent Onboarding)

**Trigger:** Ketika user mengetik `@sync` atau di awal session baru.

---

## AUTOMATIC EXECUTION STEPS

### Step 1: Documentation Refresh (2 min)
// turbo
1. Read `DOCS_HUB.md` (entry point)
2. Read `ROADMAP/CURRENT_PHASE.md` (what we're building)
3. Read `TASKS/ACTIVE_SPRINT.md` (current tasks)

### Step 2: Git Sync Check
// turbo
```powershell
git status
git log -1 --oneline
```
Report if there are uncommitted changes or if behind remote.

### Step 3: Environment Check
// turbo
```powershell
# Check if node_modules exists
Test-Path ".\node_modules"
# Check if .env exists
Test-Path ".\server\.env"
```
Alert user if dependencies missing.

### Step 4: Skill Activation
Based on `CURRENT_PHASE.md`, identify and announce relevant skills from `.agent/skills/`.

---

## STATUS DASHBOARD OUTPUT

After completing sync, provide this table:

```
## 🔄 AGENT SYNC COMPLETE

| Domain | Status | Current Focus | Relevant Skill |
|--------|--------|---------------|----------------|
| 🌱 Roots | ✅ COMPLETE | - | - |
| 🪵 Trunk | ✅ STABLE | - | - |
| 🌿 Branches | 🔄 ACTIVE | [From CURRENT_PHASE] | @[skill] |
| 🍎 Fruit | ⬜ PLANNED | - | - |

**Active Sprint:** [From ACTIVE_SPRINT.md]
**Next Task:** [First uncompleted task]
**Ready to proceed.** ✅
```

---

## FAILURE HANDLING

If any step fails:
1. Report the failure clearly
2. Suggest resolution (e.g., `git pull`, `npm install`)
3. Wait for user confirmation before proceeding

---

*This protocol ensures every agent session starts with full context.*