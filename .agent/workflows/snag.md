---
description: Protocol untuk mengatasi masalah yang persisten - eskalasi ke skills library
---

# 🔧 @SNAG PROTOCOL (Problem Escalation)

**Trigger:** Ketika user mengetik `@snag` atau ketika error yang sama terjadi 2-3x.

---

## WHEN TO USE

Use this protocol when:
1. ❌ Same error persists after 2-3 fix attempts
2. ❌ Unknown error pattern encountered
3. ❌ Architecture decision needed
4. ❌ Performance issue unclear

---

## AUTOMATIC EXECUTION STEPS

### Step 1: Problem Documentation
Document the issue clearly:
```
## 🔴 SNAG REPORT

**Error Type:** [Type: Build/Runtime/Logic/Architecture]
**Location:** [File path and line]
**Error Message:** [Exact error]
**Attempts Made:** 
1. [First attempt]
2. [Second attempt]
3. [Third attempt]
```

### Step 2: Check Troubleshoot Knowledge Base
// turbo
**FIRST**, check if the error is already documented:
```
Read: docs/troubleshoot.md
```

Look for matching patterns:
- **TS-001**: Login 401 → `npx tsx sync-creds.ts`
- **TS-030**: White Screen → Delete `client/node_modules/.vite`
- **TS-034**: Prisma EPERM → Kill node.exe, re-run prisma generate

If found, apply the documented fix immediately.

**💡 NOTE:** `docs/troubleshoot.md` syncs with:
- **Admin Panel → Debug Tab**: View live error logs
- **Admin Panel → Restore Tab**: Git commit history for rollback
- Update troubleshoot.md jika menemukan error baru yang terselesaikan

### Step 3: Skills Library Search
// turbo
Search the skills library for relevant solutions:
```powershell
# Search for relevant skills
Get-ChildItem -Path ".\.agent\skills\skills" -Recurse -Filter "*.md" | 
  Select-String -Pattern "[error-keyword]" -List | 
  Select-Object -First 5
```

### Step 4: Skill Application
If relevant skill found:
1. Read the skill's SKILL.md file
2. Follow its instructions exactly
3. Report which skill was applied

### Step 5: Escalation (if no skill found)
If no relevant skill:
1. Document the problem in `LOGS/DECISIONS.md` as "Unresolved"
2. Suggest creating a new skill
3. Ask user for guidance

---

## COMMON SNAG PATTERNS

| Pattern | Recommended Skill |
|---------|------------------|
| Prisma type errors | `systematic-debugging` |
| Import path issues | `code-refactoring-refactor-clean` |
| React hook errors | `react-best-practices` |
| Permission denied | `production-code-audit` |
| Build failures | `systematic-debugging` |
| Architecture confusion | `senior-architect` |

---

## SKILL CATEGORIES

The skills library (`.agent/skills/skills/`) contains 2600+ skills organized by:
- `systematic-debugging/` - Error resolution
- `react-*/` - Frontend patterns
- `express-*/` - Backend patterns
- `prisma-*/` - Database patterns
- `architect-*/` - System design
- `security-*/` - Security fixes

---

## SUCCESS CRITERIA

Snag is RESOLVED when:
1. ✅ Error no longer occurs
2. ✅ Solution documented (if novel)
3. ✅ TSC passes

---

*This protocol ensures problems are escalated systematically, not randomly.*
