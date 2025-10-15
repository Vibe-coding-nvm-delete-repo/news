# 🔧 Troubleshooting Guide - Common Scenarios & Solutions

**Purpose:** Quick solutions to frequently encountered situations during autonomous agent operations.

---

## 🎯 Quick Problem Index

**Jump to your scenario:**
- [Mode Selection Issues](#mode-selection-issues)
- [Diff Budget Exceeded](#diff-budget-exceeded)
- [File Access Denied](#file-access-denied)
- [Test/Lint Failures](#testlint-failures)
- [Override Request Timeout](#override-request-timeout)
- [Merge Conflicts](#merge-conflicts)
- [Stale PR Issues](#stale-pr-issues)
- [CI/CD Failures](#cicd-failures)
- [Dependency Problems](#dependency-problems)

---

## 🔀 Mode Selection Issues

### ❓ Problem: Unsure which mode to use

**Scenario:** You have Issue #123 and need to modify both `src/app/login.tsx` (allowed) and `tsconfig.json` (denied).

**Solution:**
1. Check if baseline tools are broken first:
   ```bash
   npm ci
   npx tsc --noEmit  # Does this fail BEFORE your changes?
   npm test          # Does this fail BEFORE your changes?
   ```

2. **If baseline fails:**
   - Use **Mode 1 (LTRM)** if it's local tooling (jest, tsconfig)
   - Use **Mode 2** if it's CI-specific (`.github/**`)

3. **If baseline passes:**
   - You need **Mode 3 Override** to modify `tsconfig.json`
   - Submit override request template

**Key Decision:**
- Baseline broken + tooling issue = Mode 1
- Baseline working + need restricted file = Mode 3

---

### ❓ Problem: Can I use Mode 0.5 for this cleanup?

**Scenario:** You want to remove dead code across 5 files, ~80 lines total.

**Solution:**
❌ **NO** - Mode 0.5 has strict limits: ≤50 lines, ≤2 files

**Options:**
1. **Reduce scope:** Pick only the 2 most impactful files (≤50 lines)
2. **Create issue:** Propose full cleanup as separate Mode 0 issue
3. **Split work:** Do 2-file cleanup now (Mode 0.5), rest later

**Mode 0.5 Checklist:**
- [ ] ≤50 lines?
- [ ] ≤2 files?
- [ ] No logic changes?
- [ ] No dependency changes?
- [ ] Not tied to existing issue?

If all ✅ → Mode 0.5. If any ❌ → Mode 0 with issue or Mode 3.

---

## 📏 Diff Budget Exceeded

### ❓ Problem: My fix requires 450 lines but budget is 300

**Scenario:** Issue #456 requires changes to 6 files, ~450 lines.

**Solution Path A: Break Down the Task**
1. Analyze if the work can be split into independent sub-tasks:
   ```
   Issue #456: Add user dashboard
   → Sub-issue #456a: Add dashboard route (150L, 2F)
   → Sub-issue #456b: Add dashboard components (200L, 3F)
   → Sub-issue #456c: Add dashboard API (100L, 2F)
   ```

2. Complete each sub-issue in separate PRs (Mode 0)
3. Link sub-issues to parent issue

**Solution Path B: Request Mode 3 Override**
If work cannot be split (tightly coupled):
1. Submit Mode 3 Override request
2. Justify why it's a single unit of work
3. Estimate: ~450 lines, 6 files
4. Wait for approval

**Best Practice:**
- Prefer Path A (decomposition) over Path B (override)
- Smaller PRs = faster reviews, less risk

---

### ❓ Problem: Diff budget calculation unclear

**Scenario:** I added an image file (15KB binary) and 100 lines of code. What's my diff?

**Solution:**
```
Diff Budget Calculation:
- Code/text changes: Count toward budget (100 lines)
- Non-text assets (images, fonts, binaries): NOT counted in line budget
  BUT require Mode 3 approval (asset addition policy)

Your situation:
- 100 lines code → Within 300L budget ✅
- Image file → Requires Mode 3 Override ⚠️
```

**Rule:** Non-text assets always need Mode 3, regardless of size.

---

## 🚫 File Access Denied

### ❓ Problem: Need to modify `package.json` but not in Mode 1

**Scenario:** Fixing Issue #789 requires adding a runtime dependency (`express`).

**Solution:**
```
1. Check mode:
   - Mode 0? → ❌ Runtime deps not allowed
   - Mode 1? → Only devDependencies allowed (⊆ ONE)
   
2. Required action:
   ⇒ Submit Mode 3 Override Request
   
3. Template sections to emphasize:
   - Dependency change: npm install express@^4.18.0
   - Security/License Check: MIT, 0 CVEs, actively maintained
   - Versioning Preference: Caret (^)
   - Why override: No existing HTTP server, core requirement for API
```

**DO NOT:**
- Proceed without approval
- Try to work around with Mode 0 alternatives (e.g., embedding HTTP logic)

---

### ❓ Problem: File is in allowlist but git pre-commit blocks it

**Scenario:** Modifying `src/app/page.tsx` (allowed) but Husky pre-commit rejects it.

**Solution:**
```bash
# Check what's failing
git commit -v  # See full error

# Common causes:
1. Linter errors → Run: npm run lint -- --fix
2. Format errors → Run: npm run format (if exists)
3. Type errors → Run: npx tsc --noEmit

# Fix the underlying issue, then retry commit
```

**If pre-commit modifies files:**
```bash
# Pre-commit auto-fixed files
git status  # See modified files

# Add the auto-fixes
git add .

# Commit again
git commit -m "your message"
```

**Note:** File access rules are about policy, not tooling. Husky/linters are separate checks.

---

## 🧪 Test/Lint Failures

### ❓ Problem: Tests pass locally but fail in CI

**Scenario:** `npm test` passes on your machine, fails in GitHub Actions.

**Solution:**
```bash
# 1. Check for environment-specific issues
# Compare CI env vs local:
node --version    # CI might use different Node version
npm --version

# 2. Run tests in CI-like environment
npm ci            # Clean install (not npm install)
npm test -- --runInBand --no-cache

# 3. Check for flaky tests
npm test -- --runInBand --detectOpenHandles

# 4. Common causes:
- Timezone differences (use UTC in tests)
- File path differences (use path.join, not hard-coded /)
- Async timing (missing awaits, improper cleanup)
- Port conflicts (use random ports or mock network)

# 5. Fix and verify:
# Run test 10 times to check for flakiness
for i in {1..10}; do npm test -- <test-file>; done
```

---

### ❓ Problem: Linter shows 0 errors but `--max-warnings=0` fails

**Scenario:** `npm run lint` shows no errors but CI fails.

**Solution:**
```bash
# Check warnings vs errors
npm run lint  # Might show "✓ 0 errors, 5 warnings"

# Linter with strict mode
npm run lint -- --max-warnings=0  # Fails if ANY warnings

# Fix warnings:
npm run lint -- --fix  # Auto-fix what's possible

# Manually fix remaining warnings
npm run lint  # See list of warnings
# Edit files to resolve
```

**Common warnings:**
- Unused variables → Remove or prefix with `_`
- Console.log → Remove debug code
- Missing dependencies in useEffect → Add to deps array

---

## ⏰ Override Request Timeout

### ❓ Problem: No response to Mode 3 request after 48 hours

**Scenario:** Submitted override request 2 days ago, no approval yet.

**Solution:**
```
1. Check timer: 72 hours total before auto-freeze

2. At 48 hours:
   - Send gentle reminder (ping reviewer)
   - Offer to provide additional context
   - Ask if request needs modification

3. At 72 hours (no response):
   - AUTO-SWITCH to Mode 4 (Emergency Freeze)
   - Report issue as STALLED
   - Stop all work
   - Wait for human direction

4. Document in PR:
   "⏰ Override request submitted 2025-10-12 14:30
   No response received after 72hr timeout.
   Switching to Mode 4 per Stale Work Policy."
```

**DO NOT:**
- Proceed without approval
- Assume silence means approval
- Resubmit same request repeatedly

---

## 🔀 Merge Conflicts

### ❓ Problem: Merge conflict during development

**Scenario:** Your branch `ai/123-fix-login` has conflicts with `main`.

**Solution:**
```bash
# 1. Fetch latest changes
git fetch origin

# 2. Rebase against base ref
git rebase origin/main

# 3. Resolve conflicts
# Git will pause at each conflict:
git status  # See conflicted files

# Edit files to resolve conflicts:
# Look for <<<<<<< HEAD markers
# Choose correct version
# Remove conflict markers

# 4. Mark as resolved
git add <resolved-file>
git rebase --continue

# 5. Verify all checks still pass
npm run lint -- --max-warnings=0
npx tsc --noEmit
npm test -- --runInBand
npm run build

# 6. Force push (rebase rewrites history)
git push --force-with-lease
```

**If conflict is complex:**
- Switch to Mode 4 (Emergency Freeze)
- Request human assistance
- Document conflicting changes

---

### ❓ Problem: Conflict in package-lock.json

**Scenario:** Merge conflict in lockfile.

**Solution:**
```bash
# EASY FIX: Regenerate lockfile

# 1. During rebase, use "theirs" version
git checkout --theirs package-lock.json

# 2. Regenerate based on package.json
npm install

# 3. Mark as resolved
git add package-lock.json
git rebase --continue

# 4. Verify dependencies
npm ls  # Check for issues
npm test
```

---

## 📅 Stale PR Issues

### ❓ Problem: PR open for 10 days, no response

**Scenario:** PR #45 opened 2025-10-01, today is 2025-10-11, no human interaction.

**Solution:**
```
1. Check PR status:
   - Pending requested changes? → Stale
   - No reviews at all? → Stale

2. AUTO-SWITCH to Mode 4:
   - Mark PR as Stale
   - Stop all work on that branch
   
3. Request human re-triage:
   "🧊 PR Stale: Open for 10 days without interaction.
   Per Stale PR Policy, switching to Mode 4.
   
   Options:
   A) Close as won't-fix
   B) Re-triage priority
   C) Reassign to human developer
   
   Requesting direction."

4. DO NOT:
   - Continue making changes
   - Rebase/update without instruction
   - Close PR yourself
```

---

## 🏗️ CI/CD Failures

### ❓ Problem: CI failing but all checks pass locally

**Scenario:** Local tests pass, GitHub Actions fails.

**Solution:**
```bash
# 1. Review CI logs
gh run view <run-id>  # Get detailed logs

# 2. Common CI-specific issues:

a) Missing environment variables:
   - Check .github/workflows/<workflow>.yml
   - Verify secrets are set in repo settings

b) Different Node version:
   - Check workflow: uses: actions/setup-node@v4
   - Match local Node version to CI

c) Cache issues:
   - CI might use stale cache
   - Check for cache keys in workflow
   - Try clearing cache (delete and re-run)

d) File permissions:
   - Scripts might not be executable
   - Run: chmod +x scripts/*.sh

# 3. Reproduce locally with act (GitHub Actions locally):
act -j test  # Run 'test' job locally

# 4. If CI file modification needed → Mode 2
```

---

### ❓ Problem: Need to modify `.github/**` but not in Mode 2

**Scenario:** Workflow is broken at baseline (Mode 2) but you need to add a new workflow.

**Solution:**
```
Scenario A: Baseline workflow IS broken
→ Use Mode 2 (CI_REPAIR_MODE)
→ Fix broken workflow first
→ Add new workflow in separate PR (Mode 3)

Scenario B: Baseline workflow works, need new workflow
→ Cannot use Mode 2 (not a repair)
→ Submit Mode 3 Override request
→ Justify new workflow necessity

Mode 2 is ONLY for repairs, not additions.
```

---

## 📦 Dependency Problems

### ❓ Problem: Dependency conflict after npm install

**Scenario:** After adding dependency in Mode 1, npm install fails with peer dependency conflict.

**Solution:**
```bash
# 1. Read the error carefully
npm install  # See which peers conflict

# Example error:
# npm ERR! peer dep missing: react@^18.0.0, required by react-router@6.0.0

# 2. Check your package.json versions
cat package.json | grep -A 2 dependencies

# 3. Options:

a) Update conflicting package:
   npm install react@^18.0.0

b) Use --legacy-peer-deps (temporary):
   npm install --legacy-peer-deps
   # Document in commit why this is needed

c) Choose different package:
   # If conflict is severe, pick alternative library

# 4. If in Mode 1 (dev deps only):
   - Ensure conflict is in devDependencies
   - If runtime deps affected → Need Mode 3

# 5. Document in RCA:
   "Added ts-jest@29.0.0 which required updating
   @types/jest to ^29.0.0 to resolve peer dependency."
```

---

### ❓ Problem: Package not found after install

**Scenario:** `npm install package-name` succeeds but `import` fails.

**Solution:**
```bash
# 1. Verify package is installed
npm ls package-name

# 2. Check import syntax
# CommonJS:
const pkg = require('package-name');

# ES Modules:
import pkg from 'package-name';

# 3. Check TypeScript types
npm install @types/package-name --save-dev

# 4. Clear module cache
rm -rf node_modules
npm ci

# 5. Check tsconfig.json paths
# Ensure moduleResolution is set correctly
{
  "compilerOptions": {
    "moduleResolution": "node"
  }
}
```

---

## 🎓 Escalation Decision Tree

```
START: I'm stuck / uncertain

├─ Is it a policy/mode selection question?
│   └─ YES → Review MODE_REFERENCE.md → Still stuck? → Mode 4
│
├─ Is it a technical error I can debug?
│   ├─ YES → Use this guide → Try 3 approaches
│   │        └─ Still failing? → Mode 4
│   └─ NO → Need architectural decision → Mode 4
│
├─ Is it a security/safety concern?
│   └─ YES → Mode 4 immediately (don't proceed)
│
├─ Am I waiting >72hrs for approval?
│   └─ YES → Auto-switch to Mode 4
│
└─ Is risk unclear or impact unknown?
    └─ YES → Mode 4 (don't guess)

Mode 4 = Safe default when uncertain
```

---

## 🆘 Emergency Contacts

**When to escalate beyond this guide:**

1. **Security vulnerability found** → Mode 4 + flag immediately
2. **Data loss risk** → Mode 4 + escalate
3. **Production outage** → Mode 4 + emergency protocol
4. **Compliance/legal concern** → Mode 4 + legal team

**DO NOT:**
- Try to fix security issues yourself
- Proceed with risky changes "just to see what happens"
- Hide problems or uncertainties

---

## 📚 Related Resources

- [Quick Start](./QUICK_START.md) - Basics refresher
- [Mode Reference](./MODE_REFERENCE.md) - Detailed mode rules
- [Examples](./EXAMPLES.md) - Real-world case studies
- [Templates](./TEMPLATES.md) - Communication formats
