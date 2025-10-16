# 🚀 Quick Start Guide - Autonomous Agent Operations

**Time to Productivity:** 5 minutes  
**Audience:** Developers, Agents, Reviewers

---

## 🎯 The 60-Second Overview

Our autonomous agents follow **strict governance** through **6 execution modes** that control what files can be modified and when human approval is required.

**Default Mode:** Mode 0 (Normal) - Standard bug/feature work  
**Escalation Rule:** If you need to touch restricted files → Request approval  
**Safety Net:** All PRs require human review before merge

---

## 🔢 The 6 Modes (Memorize These)

| Mode    | Name                    | When to Use                              | Files Allowed                                                     | Approval Required |
| ------- | ----------------------- | ---------------------------------------- | ----------------------------------------------------------------- | ----------------- |
| **0**   | Normal                  | Standard bugs/features                   | `app/**`, `src/**`, `tests/**`, `docs/**`                         | ❌ No             |
| **0.5** | Self-Initiated Refactor | Small cleanup (≤50 lines, ≤2 files)      | `app/**`, `src/**`, `tests/**`                                    | ❌ No             |
| **1**   | LTRM                    | Local tooling broken                     | Add: `jest.config.*`, `tsconfig*.json`, `package.json` (dev only) | ❌ No             |
| **2**   | CI_REPAIR_MODE          | CI workflows broken                      | `.github/**` only                                                 | ❌ No             |
| **3**   | Scoped Override         | Need to touch runtime deps, root configs | Explicitly approved files only                                    | ✅ **YES**        |
| **4**   | Emergency Freeze        | High risk, stalled work                  | **No modifications allowed**                                      | ✅ **YES**        |

---

## 🚦 Decision Tree (Use This Every Time)

```
START: I need to fix Issue #123
  │
  ├─ Can I fix it using only app/**, src/**, tests/**, docs/**?
  │   ├─ YES → Use Mode 0 ✅ (Proceed immediately)
  │   └─ NO → Continue ↓
  │
  ├─ Is the baseline test/typecheck broken due to local tooling?
  │   ├─ YES → Use Mode 1 (LTRM) ✅ (Announce, then proceed)
  │   └─ NO → Continue ↓
  │
  ├─ Is CI broken at baseline?
  │   ├─ YES → Use Mode 2 (CI_REPAIR) ✅ (Follow CI protocol)
  │   └─ NO → Continue ↓
  │
  ├─ Do I need to modify runtime deps, root configs, or infra?
  │   ├─ YES → STOP 🛑 Request Mode 3 Override
  │   └─ NO → Continue ↓
  │
  └─ Am I uncertain or is risk high?
      └─ YES → STOP 🛑 Use Mode 4, request human direction
```

---

## 📋 The Standard Workflow (6 Steps)

### 1️⃣ **Setup**

```bash
git fetch origin
git switch -c ai/123-fix-login-bug-202510151430 main
npm ci
npm run lint -- --max-warnings=0 || true
npx tsc --noEmit || true
npm test -- --runInBand || true
```

### 2️⃣ **Plan**

- List exact files to modify
- State assumptions (≤3)
- Define in-scope vs out-of-scope (≤3 each)
- **Declare Mode** (0, 0.5, 1, 2, or request Mode 3)

### 3️⃣ **Implement**

- Make minimal changes
- Add/adjust ≥1 unit test
- Stay within diff budget: **≤300 lines, ≤4 files**

### 4️⃣ **Commit**

```bash
git add [files]
git commit -m "fix: login validation (Fixes #123)
Mode: 0
RCA: Regex was not escaping special chars, allowing bypass.
Minimal fix: Escaped regex input in auth.ts validateEmail().
Tests: tests/auth.test.ts"
```

### 5️⃣ **Pre-PR Checks** (Run ALL)

```bash
npm run lint -- --max-warnings=0  # Must pass ✅
npx tsc --noEmit                   # Must pass ✅
npm test -- --runInBand            # Must pass ✅
npm run build                      # Must pass ✅
```

### 6️⃣ **Open PR** (Title: `/ai fix: login validation (Fixes #123)`)

- Include Mode used and reason
- Add verification steps
- **Do NOT merge** - Request human review

---

## 🚨 When to Request Override (Mode 3)

**Examples of Mode 3 triggers:**

- Adding/removing runtime dependencies (`npm install express`)
- Modifying root configs (`eslint.config.js`, `tsconfig.json` outside LTRM)
- Changing CI beyond `.github/**` scope
- Adding non-text assets (images, fonts, binaries)

**Use this template:** See [TEMPLATES.md](./TEMPLATES.md#mode-3-override-request)

---

## ✅ Acceptance Criteria (Must Pass All)

Every PR must satisfy:

- ✅ `npm run lint -- --max-warnings=0`
- ✅ `npx tsc --noEmit`
- ✅ `npm test -- --runInBand` (≥1 new/adjusted test)
- ✅ `npm run build`
- ✅ Behavior verified (steps in PR)
- ✅ Diff within budget & approved mode
- ✅ No scope creep
- ✅ **Performance**: No significant regressions
- ✅ **Security**: No hardcoded secrets
- ✅ **i18n**: No hardcoded user-facing strings

---

## 🎓 Next Steps

1. **Read:** [Mode Reference Card](./MODE_REFERENCE.md) - Deep dive on each mode
2. **Practice:** [Examples & Case Studies](./EXAMPLES.md) - See real scenarios
3. **Reference:** [Templates](./TEMPLATES.md) - Copy/paste templates
4. **Verify:** [Verification Checklist](./VERIFICATION_CHECKLIST.md) - Final audit before handoff

---

## 🆘 Common Questions

**Q: Can I read files outside the allowlist?**  
A: YES - You can read anything for context. Restrictions apply only to modifications.

**Q: What if my fix needs 350 lines (over the 300 limit)?**  
A: Break the task into smaller sub-issues, or request Mode 3 Override with justification.

**Q: Can I merge my own PR?**  
A: NO - All PRs require explicit human review and merging.

**Q: What if I don't get Mode 3 approval within 72 hours?**  
A: Auto-switch to Mode 4 (Emergency Freeze) and report as Stalled.

---

**🎯 You're Ready!** Start with Mode 0 for your next issue and escalate only when necessary.
