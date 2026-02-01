# 🧪 LABS REGISTRY: Experimental Features
**"The Nursery - Where Ideas Grow Before Graduation"**

---

## 📋 REGISTRY

| ID | Feature Name | Status | Source | Graduation Target |
|----|--------------|--------|--------|-------------------|
| L01 | Pro Bleep Test | 🧪 Standalone | `Experiment/M01-pro-bleep-test` | Integration with Training module |
| L02 | Csystem Onboarding | ✅ Graduated | `client/src/modules/core/pages/OnboardingPage.tsx` | - |
| L03 | Premium Loading Screen | ✅ Graduated | `client/src/modules/core/components/ui/PWALoadingScreen.tsx` | - |

---

## Status Legend

| Status | Meaning |
|--------|---------|
| 🧪 **Standalone** | Feature created, not integrated to main tree |
| 🔄 **Integrating** | Currently being merged into main codebase |
| ✅ **Graduated** | Successfully merged into main tree |
| ❌ **Archived** | Cancelled or deprecated |

---

## Graduation Criteria

A feature can graduate from LABS when:
1. ✅ Passes `tsc --noEmit` (no type errors)
2. ✅ Has proper permissions configuration
3. ✅ Has valid route in `App.tsx`
4. ✅ Follows module structure (mirroring pattern)
5. ✅ Reviewed and approved by architect

---

## How to Add New Labs Feature

1. Create folder in `sip/LABS/[feature-name]/`
2. Add entry to this REGISTRY.md
3. Document in feature's own README.md
4. When ready, use `@architect` to review graduation

---

## Integration Queue (Priority Order)

| Priority | Feature | Notes |
|----------|---------|-------|
| P1 | Pro Bleep Test | Valuable for training, standalone works |
| P2 | Csystem Onboarding | Needs full flow review |

---

## External Experiments

These features live in `D:\Experiment\` and need to be moved to `sip/LABS/` for proper tracking:

| Folder | Description | Action |
|--------|-------------|--------|
| `M01-pro-bleep-test` | AI-powered bleep test | Move to `sip/LABS/bleep-test/` |
| `M02-Csystem-onboarding` | Premium onboarding flow | Move to `sip/LABS/onboarding/` |
| `M03-Loading` | Loading screen animation | ✅ Already graduated |
| `PromptPlanning` | AI prompt experiments | Archive or move |

---

*Last Updated: 2026-01-31 21:30 WIB*
