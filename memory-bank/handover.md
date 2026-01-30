# SIP Corelink Handover Guide

## 🚀 The Ultimate Starter Prompt
Copy-paste this prompt at the beginning of your next session with a new agent:

```text
Please initialize yourself by reading 'BLUEPRINT_V2.md' and the 'memory-bank/' directory. 
Your current goal is documented in 'memory-bank/activeContext.md'.

IMPORTANT: You must use the specialized skills library located at '.agent/skills/'. 
Before starting any technical task (Prisma, Debugging, UI/UX), search the 'CATALOG.md' 
in that directory and invoke the appropriate specialized skill (e.g., 'prisma-expert', 'error-detective'). 
Using these skills will significantly accelerate our progress.

Current priority: Resolve the 500 Internal Server Errors on login and implement the Role Integration Handshake system.
```

## 📝 Current Session Summary (Jan 31, 2026)
- **Achievements**:
    - Established formal Memory Bank (`memory-bank/`).
    - Fixed Root Identity fields (`DOB`, `Gender`) at the `User` model level.
    - Integrated Innovation Control Panel and Labs Gallery.
    - Cleaned up architecture mirroring (Modular Monolith).
- **In-Progress**:
    - Debugging Login 500 errors (Suspected SQLite/Process lock).
    - Planning Role Integration (Handshake system).

## 🛠️ Technical Reminders for next agent
1. **SQLite Process Lock**: If you see `EPERM` during `prisma generate`, force-kill all node processes using `taskkill /F /IM node.exe /T`.
2. **C-A-R Protocol**: Always follow the Context, Action, Result protocol in your planning.
3. **Modular Galaxy**: No cross-module imports except via `core`.
