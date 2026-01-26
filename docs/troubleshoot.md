# Troubleshoot Log

## 2026-01-26: Login Failure (401 / Crash)
- **Problem**: User reported "cant login" and "connection refused".
- **Root Cause 1**: `JSON.parse` in `auth.controller.ts` crashed on undefined/malformed `manpower.shortcuts` data.
- **Root Cause 2**: Dev servers were down.
- **Solution 1**: Implemented `safeJsonParse` helper in `auth.controller.ts`.
- **Solution 2**: Restarted backend (`npm run dev` port 5000) and frontend (`npm run dev` port 5173).

## 2026-01-26: AuthContext 401 on Reload
- **Problem**: Console showed 401 on `/auth/me` after restart.
- **Analysis**: Normal behavior. Stale token in local storage invalid after server restart/session expiry.
- **Action**: AuthContext correctly cleared storage and reset state. No code fix needed.
