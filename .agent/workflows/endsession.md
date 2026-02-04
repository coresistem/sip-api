---
description: Protocol untuk mengakhiri sesi dengan bersih - memastikan semua dokumen terupdate
---

# 🏁 @ENDSESSION PROTOCOL (Clean Exit)

**Trigger:** Ketika user mengetik `@endsession` atau sebelum meninggalkan session.

---

## PURPOSE

Ensure the next session (by same or different agent) can continue seamlessly:
1. All progress documented
2. No broken builds left behind
3. Git state clean for cross-device sync

---

## AUTOMATIC EXECUTION STEPS

### Step 1: Build Verification
// turbo
Run lint protocol to ensure no broken builds:
```powershell
cd server; npx tsc --noEmit 2>&1 | Select-Object -First 5
cd ../client; npx tsc --noEmit 2>&1 | Select-Object -First 5
```

Report results:
- ✅ Server TSC: Exit Code 0
- ✅ Client TSC: Exit Code 0

### Step 2: Update CURRENT_PHASE.md
Update `ROADMAP/CURRENT_PHASE.md` with:
- What was accomplished this session
- Any blockers encountered
- Next recommended action

### Step 3: Update ACTIVE_SPRINT.md
Update `TASKS/ACTIVE_SPRINT.md`:
- Move completed tasks to "Completed This Sprint"
- Update "In Progress" status
- Add any new tasks discovered

### Step 4: Update MASTER_CHECKLIST.md
If any major milestone completed:
- Mark items as [x] in `ROADMAP/MASTER_CHECKLIST.md`
- Update progress percentages

### Step 5: Update LOGS/DECISIONS.md (if applicable)
If any architecture decisions were made:
- Add entry to `LOGS/DECISIONS.md`

### Step 6: Update docs/troubleshoot.md (Critical)
If any **new bugs** were fixed (e.g., TS-0XX):
- Add entry to `docs/troubleshoot.md` following the template
- Update the Active Issues Index table
- This ensures the Knowledge Base grows with every session

### Step 7: Session Summary
Provide summary:
```
## 🏁 SESSION COMPLETE

**Date:** [Current date/time]
**Duration:** [Approximate]

### Completed This Session:
- [Item 1]
- [Item 2]

### Documentation Updated:
- [ ] troubleshoot.md (Added: TS-___)
- [ ] LOGS/DECISIONS.md
- [ ] ROADMAP/CURRENT_PHASE.md

### Build Status:
- Server: ✅/❌
- Client: ✅/❌

### Next Session Should:
1. [First priority]
2. [Second priority]

**Ready for Git Push:** ✅/❌
```

---

## SKILLS VERIFICATION (Cross-Device Sync)

Before git push, verify skills submodule is tracked:
```powershell
# Check submodule status
git submodule status

# If skills not tracked or outdated, update:
git submodule update --init --recursive

# Add submodule changes
git add .agent/skills
```

**Skills Count Check:**
```powershell
(Get-ChildItem -Path ".\.agent\skills" -Recurse -Filter "SKILL.md" | Measure-Object).Count
# Expected: ~625 SKILL.md files (1136 total .md files)
```

If skills count is significantly different between devices, re-clone the submodule:
```bash
git submodule deinit -f .agent/skills
git submodule update --init --recursive
```

---

## GIT PUSH REMINDER

After endsession, remind user:
```bash
# Recommended commands for cross-device sync:
git add .
git commit -m "session: [brief description]"
git push origin main
```

---

## HANDOVER NOTES

If anything unusual:
1. Document in `LOGS/DECISIONS.md`
2. Add note in `ROADMAP/CURRENT_PHASE.md` under "Blockers"
3. Mention explicitly in session summary

---

## ADMIN PANEL SYNC (Debug & Restore)

Jika sesi melibatkan perubahan penting ke database atau konfigurasi:

1. **Debug Tab**: Cek error logs di Admin Panel → Debug
2. **Restore Tab**: Pastikan Git restore points tersedia
3. **Quick Verify**: Login sebagai `admin@sip.id` dan navigasi ke Super Admin → Debug/Restore

Troubleshoot yang perlu di-log:
- Prisma migration issues → `LOGS/DECISIONS.md`
- Auth/Role problems → `LOGS/DECISIONS.md`  
- Build failures → Jalankan `/lint-protocol` dulu

---

*This protocol ensures no context is lost between sessions.*
