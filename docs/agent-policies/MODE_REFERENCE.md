# 📖 Mode Reference Card - Complete Specification

**Quick Lookup:** Use this as your single source of truth for mode selection and constraints.

---

## 🔢 Mode 0 — Normal (Default)

### When to Use
- Standard bug fix or feature implementation
- Tied to an existing issue number
- Changes limited to application code

### File Access Rules

**✅ ALLOW (Modify)**
- `app/**` - Application code
- `src/**` - Source code
- `tests/**` - Test files
- `docs/**` - Documentation

**🚫 DENY (Read-Only)**
- All root configs (`eslint.config.*`, `prettier*`, `tsconfig*.json`)
- Dependencies (`package.json`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`)
- CI/CD (`.github/**`)
- Environment (`.env*`, `.devcontainer/**`)
- Tooling (`jest.config.*`, `babel.config.*`, `husky/**`)
- Infrastructure (`Dockerfile*`, `vercel.*`, `scripts/**`)

**EXCEPTION:** You may modify root configs/dependencies IF you believe unequivocally and conclusively they MUST be changed to fix a core issue. Never hold back from making necessary changes!

### Constraints
- **Diff Budget:** ≤300 lines, ≤4 files
- **Runtime Dependencies:** No additions/removals
- **Non-Text Assets:** Not permitted (requires Mode 3)

### Action Required
✅ **Proceed immediately** - No approval needed

### Example Scenarios
- Fix validation bug in login form
- Add new API endpoint
- Update component styling
- Refactor utility function (within budget)

---

## 🔧 Mode 0.5 — Self-Initiated Refactor

### When to Use
- Small, beneficial technical debt reduction
- Dead code removal
- Small type cleanup
- **NOT tied to an existing issue**

### File Access Rules

**✅ ALLOW (Modify)**
- `app/**`
- `src/**`
- `tests/**`

**🚫 DENY**
- `docs/**` (no documentation changes)
- All root configs
- All dependencies

### Constraints
- **Diff Budget:** ≤50 lines, ≤2 files (STRICT)
- **Logic Changes:** Not permitted
- **Dependencies:** No additions/removals
- **Commit Prefix:** Must use `refactor:`

### Action Required
1. Announce switch to Mode 0.5
2. Proceed immediately
3. State cleanup benefit in PR body

### Example Scenarios
- Remove unused import statements (3 files, 12 lines)
- Delete commented-out code block (1 file, 25 lines)
- Simplify type definition (1 file, 8 lines)

### Non-Examples (Do NOT use Mode 0.5 for)
- Extracting a new shared function (logic change)
- Renaming variables across multiple files (>2 files)
- Updating documentation (not allowed in 0.5)

---

## 🛠️ Mode 1 — LTRM (Local Tooling Repair Mode)

### When to Use
**ONLY when** baseline test/typecheck fails due to local configuration issues:
- Jest configuration broken
- TypeScript config errors
- Test setup file issues

### File Access Rules

**✅ TEMPORARILY ALLOW (In Addition to Mode 0)**
- `jest.config.*`
- `tsconfig*.json`
- `tests/setup*.ts`
- `package.json` - **ONLY** `scripts` + `devDependencies` sections
- Allow **ONE** devDep addition (`@swc/jest` or `ts-jest`)
- Lockfile modification (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`) if devDep added

**🚫 STILL DENY**
- Runtime dependencies
- Other root configs
- CI/CD files
- Production dependencies

### Constraints
- **Diff Budget:** ≤120 lines, ≤2 files
- **RCA Required:** 3-5 line root cause analysis in commit

### Action Required
1. Announce switch to Mode 1
2. Proceed immediately
3. Include RCA in commit message

### Example Scenarios
- Jest can't parse TypeScript → Add `ts-jest` devDependency
- tsconfig.json missing `paths` causing import failures
- Test setup file missing global mocks

### Verification Steps
```bash
# Before claiming LTRM need:
npm ci
npx tsc --noEmit  # Must fail at baseline
npm test          # Must fail at baseline

# After LTRM fix:
npx tsc --noEmit  # Must now pass ✅
npm test          # Must now pass ✅
```

---

## 🔄 Mode 2 — CI_REPAIR_MODE

### When to Use
**ONLY when** workflows under `.github/**` are broken at baseline

### File Access Rules

**✅ ALLOW (Modify)**
- `.github/**` - Workflow files, action configs

**🚫 DENY**
- Everything else (even Mode 0 allowlist is restricted)

### Constraints
- **Follow CI-Repair Protocol:**
  - Use canary approach (test in isolated workflow first)
  - Keep diffs tiny and surgical
  - Pin action versions explicitly

### Action Required
1. Declare Mode 2
2. Follow CI-Repair Protocol
3. Document baseline failure evidence

### Example Scenarios
- GitHub Actions workflow syntax error
- Deprecated action version
- Missing workflow permission

### Protocol
1. Reproduce failure locally via `act` or workflow logs
2. Fix in canary workflow first
3. Apply to main workflows after validation
4. Pin all action versions (e.g., `actions/checkout@v4.1.0`)

---

## 🚨 Mode 3 — Scoped Override

### When to Use
Solution **necessarily** requires modifying:
- Runtime dependencies
- Root configuration files (outside LTRM scope)
- Infrastructure files
- Non-text assets (images, fonts, binaries)
- Large asset additions

### File Access Rules

**✅ ALLOW**
- **ONLY** paths explicitly listed in the approved override request
- No other files may be modified

### Constraints
- **Approval Required:** MUST receive `APPROVED_OVERRIDE` token
- **File List:** Save approved paths to `PROPOSED_FILES.txt`
- **Pre-Commit Guard:** Verify staged files ⊆ `PROPOSED_FILES.txt`

### Action Required
1. **STOP** all work immediately
2. Submit Override Request using template (see [TEMPLATES.md](./TEMPLATES.md#mode-3-override-request))
3. Wait for `APPROVED_OVERRIDE: Mode 3 (Option X)` response
4. Proceed ONLY with approved paths

### Request Must Include
- Issue number
- Why override is needed (≤5 lines)
- Options considered (≥3)
- Proposed plan (chosen option)
  - Exact paths to modify
  - Estimated diff (~lines, files)
  - Dependency change details
  - Security/license review
  - Versioning preference (Caret/Tilde/Pinned)
  - Rollback plan
  - Tests to add
  - Timebox estimate
- Evidence pack (repro commands, logs, links)

### Example Scenarios
- Adding `express` runtime dependency for new API
- Modifying `next.config.ts` to add image optimization
- Adding brand logo image (non-text asset)
- Updating `eslint.config.js` for new rule

### Timeout Policy
- If no response within **72 hours** → Auto-switch to Mode 4 (Emergency Freeze)

---

## 🧊 Mode 4 — Emergency Freeze

### When to Use
- Risk is high
- Impact is unknown
- Ambiguity remains
- Work is stalled pending review
- Auto-triggered by stale Mode 3 request (72hr timeout)
- Auto-triggered by stale PR (10 days without interaction)

### File Access Rules

**🚫 DENY ALL MODIFICATIONS**
- No file modifications allowed
- Read-only mode

### Action Required
1. **STOP** all work immediately
2. Report current status
3. Request immediate human direction
4. Document:
   - What's blocked
   - What's been tried
   - What information is needed
   - Risk assessment

### Example Scenarios
- Merge conflict resolution unclear
- Test failures with unknown root cause
- Conflicting requirements discovered
- Security vulnerability found
- Architecture decision needed

### Exit Mode 4
Human must provide explicit direction:
- `PROCEED_WITH_MODE_X` - Switch to specified mode
- `ABANDON_WORK` - Close issue as won't-fix
- `REASSIGN` - Hand off to human developer

---

## 📊 Mode Comparison Matrix

| Aspect | Mode 0 | Mode 0.5 | Mode 1 | Mode 2 | Mode 3 | Mode 4 |
|--------|--------|----------|--------|--------|--------|--------|
| **Approval** | No | No | No | No | **YES** | **YES** |
| **Diff Budget** | 300L/4F | 50L/2F | 120L/2F | Minimal | Per approval | N/A |
| **Runtime Deps** | No | No | No | No | With approval | No |
| **Root Configs** | No* | No | Limited | No | With approval | No |
| **Issue Required** | Yes | No | Yes | Yes | Yes | Yes |
| **Auto-Trigger** | Manual | Manual | Manual | Manual | Manual | Auto (timeout) |

*Exception: May modify if conclusively necessary to fix core issue

---

## 🎯 Mode Selection Flowchart

```
┌─────────────────────────────────────┐
│ START: Analyze Issue Requirements  │
└──────────────┬──────────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │ Baseline checks pass?│
    └──────┬───────────────┘
           │
     NO ───┤
           │     ┌─────────────────────┐
           │     │ CI broken?          │
           ├────▶│ → Mode 2            │
           │     └─────────────────────┘
           │
           │     ┌─────────────────────┐
           │     │ Local tooling?      │
           └────▶│ → Mode 1            │
                 └─────────────────────┘
                 
     YES ──┐
           │
           ▼
    ┌──────────────────────────────────┐
    │ Files needed within allowlist?   │
    └──────┬───────────────────────────┘
           │
     YES ──┤
           │     ┌─────────────────────┐
           │     │ Issue exists?       │
           ├────▶│ YES → Mode 0        │
           │     │ NO → Mode 0.5       │
           │     │ (if ≤50L/2F refactor)│
           │     └─────────────────────┘
           │
     NO ───┤
           │
           ▼
    ┌──────────────────────────────────┐
    │ Request Mode 3 Override          │
    │ ↓                                │
    │ Await APPROVED_OVERRIDE          │
    │ ↓                                │
    │ 72hr timeout? → Mode 4           │
    └──────────────────────────────────┘
```

---

## 🔖 Quick Reference Tags

Use these tags to quickly find mode details:

- `#approval-not-required` → Modes 0, 0.5, 1, 2
- `#approval-required` → Modes 3, 4
- `#can-modify-deps` → Mode 1 (dev only), Mode 3 (with approval)
- `#can-modify-configs` → Mode 1 (limited), Mode 3 (with approval)
- `#strict-budget` → Mode 0.5 (50L/2F)
- `#standard-budget` → Mode 0 (300L/4F), Mode 1 (120L/2F)
- `#auto-triggered` → Mode 4 (stale work)
