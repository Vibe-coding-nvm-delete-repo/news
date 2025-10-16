# 🔄 Workflow Guide - Complete Step-by-Step Processes

**Purpose:** Detailed, actionable workflows for all common autonomous agent operations.

---

## 📑 Workflow Index

- [Standard Feature/Bug Workflow](#standard-featurebug-workflow)
- [Self-Initiated Refactor Workflow](#self-initiated-refactor-workflow)
- [LTRM Workflow](#ltrm-workflow-local-tooling-repair)
- [CI Repair Workflow](#ci-repair-workflow)
- [Mode 3 Override Workflow](#mode-3-override-workflow)
- [Emergency Freeze Workflow](#emergency-freeze-workflow)
- [Fix Verification Workflow](#fix-verification-workflow)

---

## 🔨 Standard Feature/Bug Workflow

**Use Case:** Normal Mode 0 bug fix or feature implementation

### Step 1: Reproduce (Branch Setup)

#### 1.1 Create Branch

```bash
# Fetch latest
git fetch origin

# Create branch with naming convention
git switch -c ai/<ISSUE_NUMBER>-<kebab-description>-<YYYYMMDDHHmm> <BASE_REF>

# Example:
git switch -c ai/123-fix-login-validation-202510151430 main
```

**Branch Naming Rules:**

- Prefix: `ai/`
- Issue number
- Kebab-case description
- Timestamp (YYYYMMDDHHmm)

#### 1.2 Install Dependencies

```bash
npm ci  # NOT npm install (ensures clean state)
```

#### 1.3 Run Baseline Checks

```bash
# TypeScript check
npx tsc --noEmit || true

# Build check
npm run build || true

# Test suite
npm test -- --runInBand || true
```

**Decision Point:**

- **All pass** → Continue to Step 2 (Mode 0)
- **Tooling fails** → See [LTRM Workflow](#ltrm-workflow-local-tooling-repair)
- **CI fails** → See [CI Repair Workflow](#ci-repair-workflow)

#### 1.4 Document Baseline State

```markdown
## Baseline Check Results

**Date:** 2025-10-15 14:30
**Branch:** ai/123-fix-login-validation-202510151430
**Base:** main (commit: abc1234)

- TypeScript: ✅ PASS
- Build: ✅ PASS
- Tests: ✅ PASS (47 tests, 0 failures)
- Lint: ✅ PASS (0 warnings)

**Conclusion:** Mode 0 (Normal) - Proceed with implementation
```

---

### Step 2: Plan

#### 2.1 Analyze Issue Requirements

```markdown
## Issue Analysis

**Issue #123:** Users can bypass email validation with special characters

**Acceptance Criteria:**

- [ ] Email validation rejects special regex characters
- [ ] Existing valid emails still pass
- [ ] Error message is clear for invalid emails
- [ ] ≥1 unit test added
```

#### 2.2 Complexity Check

```bash
# Estimate changes needed
# If exceeds Mode 0 budget (>300L or >4F) by 50%:
# → Propose task decomposition
# → Break into sub-issues

# Example:
# Estimated: 450 lines, 6 files → TOO LARGE
# Solution: Break into 2 issues
```

#### 2.3 Create Technical Plan

```markdown
## Technical Plan

**Mode Declaration:** Mode 0 (Normal)
**Rationale:** Bug fix in application code, no restricted files needed.

**Files to Modify:**

1. `src/auth/validator.ts` - Fix regex escaping bug
2. `tests/auth/validator.test.ts` - Add regression tests

**Diff Estimate:** ~45 lines, 2 files (Budget: 300L/4F ✅)

**Assumptions:**

1. Regex escaping is the root cause (not sanitization elsewhere)
2. No breaking changes to validator API
3. Existing tests have good coverage (just need regression test)

**In Scope:**

- Fix email validation regex
- Add test for special character rejection
- Maintain backward compatibility

**Out of Scope:**

- Refactor entire validator module
- Change validator API signature
- Add email verification flow

**Relevant Standards:**

- ENGINEERING_STANDARDS.md §3.2: Input validation must escape regex
- OWASP: Validate input before regex matching
```

#### 2.4 Technical Debt Review

```markdown
## Technical Debt Identified

**Finding 1:** No logging for validation failures

- **Scope:** Add structured logging to validator
- **Justification:** Would help debug future validation issues
- **Complexity:** Medium (50L, 2F)
- **Action:** NOT implementing in this PR (scope creep)
- **Proposal:** Will include in PR body for human review

**Finding 2:** None other identified
```

---

### Step 3: Implement

#### 3.1 Write Code

```typescript
// src/auth/validator.ts

// Helper function (add at top of file)
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Fix the buggy function
export function validateEmail(email: string): boolean {
  const escapedEmail = escapeRegex(email); // FIX: Escape input
  const regex = new RegExp(`^${escapedEmail}@`);
  return regex.test(email);
}
```

#### 3.2 Write/Update Tests

```typescript
// tests/auth/validator.test.ts

describe('validateEmail', () => {
  // ... existing tests ...

  // NEW: Regression test
  describe('special character handling', () => {
    it('should reject emails with regex special chars', () => {
      expect(validateEmail('admin@[localhost]')).toBe(false);
      expect(validateEmail('user@domain.*')).toBe(false);
      expect(validateEmail('test@server.+')).toBe(false);
    });

    it('should still accept valid emails', () => {
      expect(validateEmail('user@domain.com')).toBe(true);
      expect(validateEmail('test@example.org')).toBe(true);
    });
  });
});
```

#### 3.3 Pre-Commit Checks (Manual)

```bash
# Verify allowlist/denylist compliance
git status

# Check diff size
git diff --stat
# Should show: ≤300 lines, ≤4 files

# If Mode 3: Verify files in PROPOSED_FILES.txt
# (Not applicable for Mode 0)
```

#### 3.4 Run Quality Checks

```bash
# Linter
npm run lint -- --max-warnings=0
# ✅ Must pass (no warnings)

# TypeScript
npx tsc --noEmit
# ✅ Must pass (no errors)

# Tests
npm test -- --runInBand
# ✅ Must pass (all tests green)

# Build
npm run build
# ✅ Must pass (build succeeds)
```

#### 3.5 Merge Conflict Check

```bash
# Rebase if needed
git fetch origin
git rebase origin/main

# If conflicts occur:
# 1. Resolve conflicts manually
# 2. git add <resolved-files>
# 3. git rebase --continue
# 4. Re-run quality checks (Step 3.4)
```

---

### Step 4: Commit

#### 4.1 Stage Changes

```bash
git add src/auth/validator.ts tests/auth/validator.test.ts
```

#### 4.2 Write Commit Message (Use Template)

```bash
git commit -m "$(cat <<'EOF'
fix: email validation bypass (Fixes #123)

Mode: 0
RCA: The email validation regex in src/auth/validator.ts was not escaping
special characters, allowing emails like "admin@[localhost]" to bypass
validation. This occurred because the regex used raw user input in the
RegExp constructor, enabling potential XSS via crafted email addresses.
Minimal fix: Added escapeRegex() helper to sanitize input before regex creation.
Tests: tests/auth/validator.test.ts
EOF
)"
```

**Commit Message Checklist:**

- [ ] Type prefix (`fix:`, `feat:`, `refactor:`)
- [ ] Short description
- [ ] Issue reference `(Fixes #123)`
- [ ] Mode declaration
- [ ] RCA (3-5 lines, specific and technical)
- [ ] Minimal fix description (1-2 lines)
- [ ] Test file reference

---

### Step 5: PR Preparation & Opening

#### 5.1 Push Branch

```bash
git push -u origin ai/123-fix-login-validation-202510151430
```

#### 5.2 Create PR (Using Template)

```bash
gh pr create --title "/ai fix: email validation bypass (Fixes #123)" --body "$(cat <<'EOF'
## Summary
Fixes #123 — Email validation was bypassable with regex special characters

## Changes
- Added `escapeRegex()` helper function to sanitize user input
- Fixed `validateEmail()` to escape input before regex creation
- Added regression tests for special character scenarios

## Root Cause Analysis
The email validation regex in `src/auth/validator.ts` was constructing
a RegExp using raw user input without escaping. This allowed attackers
to craft emails with regex special characters (e.g., `admin@[localhost]`)
to bypass validation, potentially enabling XSS attacks via email injection.

## How to Verify
1. Checkout this branch: `git checkout ai/123-fix-login-validation-202510151430`
2. Run tests: `npm test -- tests/auth/validator.test.ts`
3. Expected result: All tests pass, including new special character tests
4. Manual test: Try email `admin@[localhost]` → Should reject

## Tests Added/Modified
- `tests/auth/validator.test.ts`: Added 2 test cases for special character rejection

## Risks & Limitations
- None identified (backward compatible change)

## 🧩 Conformance
- **Policy Mode:** Mode 0 (Normal)
- **Reason:** Bug fix in application code (`src/**`, `tests/**`)
- **Diff:** 45 lines, 2 files (Budget: 300L/4F ✅)
- **Standards:** Per ENGINEERING_STANDARDS.md §3.2 (input escaping)

## Acceptance Criteria
- ✅ `npm run lint -- --max-warnings=0`
- ✅ `npx tsc --noEmit`
- ✅ `npm test -- --runInBand`
- ✅ `npm run build`
- ✅ Behavior verified (see steps above)
- ✅ No scope creep

## 💡 New Issue Proposals (Technical Debt Identified)

### Proposal 1: Add Error Logging to Validator
**Scope:** Add structured logging for all validation failures
**Justification:** Would help debug future validation issues
**Estimated Complexity:** Medium (50 lines, 2 files)
**Mode Required:** Mode 0
**Suggested Priority:** P3 (Nice-to-have)

EOF
)"
```

#### 5.3 Verify PR Created

```bash
gh pr view --web  # Open in browser

# Confirm:
# - Title starts with /ai
# - Issue is linked
# - All sections complete
```

---

### Step 6: Final Review & Handoff

#### 6.1 Final Checklist

```markdown
## Final Review Checklist

- [ ] PR cross-linked to Issue #123
- [ ] All Acceptance Criteria met and documented
- [ ] Evidence pack complete (test output, verification steps)
- [ ] CI status: Pending/Green
- [ ] No files outside approved mode allowlist
- [ ] Diff within budget
- [ ] Commit message follows template
- [ ] Branch naming correct
- [ ] PR title has /ai prefix
```

#### 6.2 Set PR Status

```bash
# Add label
gh pr edit --add-label "ready-for-review"

# Request review (if configured)
gh pr edit --add-reviewer "@tech-lead"
```

#### 6.3 Report to User

```markdown
✅ **PR Ready for Review**

**Issue:** #123 - Email validation bypass
**PR:** #234 - /ai fix: email validation bypass
**Link:** https://github.com/org/repo/pull/234

**Summary:**

- Fixed regex escaping bug in email validator
- Added regression tests
- All checks passing ✅
- Diff: 45 lines, 2 files (within budget)

**Next Step:** Awaiting human review before merge.
```

---

## 🔧 Self-Initiated Refactor Workflow

**Use Case:** Mode 0.5 cleanup (no existing issue)

### Prerequisites Check

```bash
# Before starting, verify:
# 1. Estimated changes ≤50 lines, ≤2 files?
# 2. No logic changes?
# 3. No dependency changes?
# 4. App/src/tests files only?

# If ANY "no" → Create issue, use Mode 0 instead
```

### Step 1: Announce Mode Switch

```markdown
## Mode 0.5 Declaration

**Type:** Self-Initiated Refactor
**Trigger:** Identified dead code during work on Issue #200
**Scope:** Remove 3 unused utility functions from src/utils/date.ts
**Benefit:** Reduce bundle size ~1.2KB, improve code maintainability
**Est Diff:** 47 lines, 1 file (Budget: 50L/2F ✅)
```

### Step 2-6: Follow Standard Workflow

With these modifications:

- **Branch naming:** `ai/refactor-<description>-<timestamp>` (no issue number)
- **Commit prefix:** `refactor:` (not `fix:` or `feat:`)
- **Commit message:** Include "Mode: 0.5 (Self-Initiated)" and cleanup benefit
- **PR title:** `/ai refactor: <description>` (no issue reference)

### Example Commit

```bash
git commit -m "$(cat <<'EOF'
refactor: remove unused date utilities

Mode: 0.5 (Self-Initiated)
Cleanup benefit: Removed formatDateLong, formatDateShort, and parseISODate
utilities that haven't been used in 8+ months (per git blame). Reduces
bundle size by ~1.2KB and cognitive load.
Impact: src/utils/date.ts (47 lines removed)
EOF
)"
```

---

## 🛠️ LTRM Workflow (Local Tooling Repair)

**Use Case:** Mode 1 when baseline tests/typecheck fail due to local config

### Step 1: Confirm LTRM Need

#### 1.1 Baseline Failure Evidence

```bash
# Fresh install
npm ci

# Check TypeScript
npx tsc --noEmit
# ❌ FAIL: "Cannot find module '@/utils'"

# Check tests
npm test
# ❌ FAIL: "SyntaxError: Unexpected token 'export'"

# Check build
npm run build
# ✅ PASS (or ❌ FAIL if build tooling broken)
```

#### 1.2 Classify the Issue

```
Is it a local tooling issue? (Jest, tsconfig, test setup)
  YES → Proceed with LTRM
  NO → Not LTRM eligible (use Mode 3 or Mode 4)

Examples of LTRM-eligible issues:
✅ Jest can't parse TypeScript (missing transformer)
✅ tsconfig paths not resolving (missing baseUrl)
✅ Test setup file missing global mocks

NOT LTRM-eligible:
❌ Tests fail due to logic bugs (use Mode 0)
❌ Build fails due to syntax error (use Mode 0)
❌ CI workflows broken (use Mode 2)
```

### Step 2: Announce LTRM Mode

```markdown
## LTRM Declaration (Mode 1)

**Issue:** #345 - Test suite failing with syntax errors
**Baseline Failure:** Jest cannot parse TypeScript files
**Root Cause (Initial):** Missing ts-jest transformer
**Mode Justification:** Local tooling repair needed before implementing fix
```

### Step 3: Implement Tooling Fix

#### 3.1 Modify Allowed Files

```bash
# Mode 1 temporarily allows:
# - jest.config.*
# - tsconfig*.json
# - tests/setup*.ts
# - package.json (scripts + devDependencies ONLY)
# - ONE devDep addition allowed
# - Lockfile (auto-generated)
```

#### 3.2 Make Minimal Changes

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest', // ADD THIS
  testEnvironment: 'node',
  // ... rest unchanged
};
```

```json
// package.json
{
  "devDependencies": {
    "ts-jest": "^29.1.0" // ADD THIS (ONE devDep allowed)
  }
}
```

### Step 4: Verify Tooling Fixed

```bash
# Run baseline checks again
npx tsc --noEmit
# ✅ PASS

npm test
# ✅ PASS

# Confirm diff within budget
git diff --stat
# 18 insertions (excluding lockfile) → ✅ Within 120L/2F
```

### Step 5: Commit with LTRM Template

```bash
git commit -m "$(cat <<'EOF'
fix: jest unable to parse TypeScript (Fixes #345)

Mode: 1 (LTRM)
RCA: Jest was failing with 'SyntaxError: Unexpected token export' when
running tests. Root cause: jest.config.js was missing the ts-jest transformer.
This occurred after upgrading to TypeScript 5.x which changed module resolution.
Baseline tests confirmed this was a pre-existing issue.
Minimal fix: Added ts-jest@29.1.0 devDependency and configured preset in jest.config.js.
Tests: Baseline test suite now passes (npm test)
EOF
)"
```

### Step 6: Continue with Original Issue

```markdown
## LTRM Complete

**Tooling Fix:** ✅ Complete
**Next Step:** Resume work on Issue #345 main objective (bug fix)
**Mode:** Return to Mode 0 for application code changes
```

---

## 🔄 CI Repair Workflow

**Use Case:** Mode 2 when `.github/**` workflows broken at baseline

### Step 1: Confirm CI Broken at Baseline

#### 1.1 Check Baseline CI Status

```bash
# View recent CI runs
gh run list --limit 5

# Check specific workflow
gh run view <run-id>

# Confirm: CI failing BEFORE your changes
# Common symptoms:
# - "actions/checkout@v3 not found" (deprecated action)
# - "Node 16 is deprecated" (EOL version)
# - Workflow syntax errors
```

### Step 2: Declare Mode 2

```markdown
## CI_REPAIR_MODE Declaration (Mode 2)

**Issue:** #456 - GitHub Actions failing with deprecated action
**Baseline Failure:** actions/checkout@v3 returns 404
**Root Cause:** GitHub deprecated v3 on 2025-10-01
**Mode Justification:** CI workflows broken, requires `.github/**` modification
```

### Step 3: Follow CI-Repair Protocol

#### 3.1 Create Canary Workflow (Test First)

```yaml
# .github/workflows/test-canary.yml
name: Canary Test

on:
  push:
    branches: [ai/456-*] # Only this branch

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4.1.0 # PINNED VERSION
      - uses: actions/setup-node@v4.0.0 # PINNED VERSION
        with:
          node-version: 20
      - run: npm ci
      - run: npm test
```

#### 3.2 Test Canary

```bash
git add .github/workflows/test-canary.yml
git commit -m "test: add canary workflow for CI repair"
git push

# Wait for canary to complete
gh run watch

# Verify: ✅ Canary passed
```

#### 3.3 Apply to Main Workflows

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4.1.0 # Updated, pinned
      - uses: actions/setup-node@v4.0.0 # Updated, pinned
        with:
          node-version: 20 # Updated
      - run: npm ci
      - run: npm test -- --runInBand
```

### Step 4: Commit with CI_REPAIR Template

```bash
git commit -m "$(cat <<'EOF'
fix: update deprecated GitHub Actions (Fixes #456)

Mode: 2 (CI_REPAIR)
RCA: GitHub Actions workflows failing with 'actions/checkout@v3 not found'.
Root cause: GitHub deprecated v3 on 2025-10-01. Unpinned version references
auto-upgraded but require updated Node version for v4 compatibility.
Fix: Updated to checkout@v4.1.0 and setup-node@v4.0.0 with Node 20.
Protocol: Tested in canary workflow first, pinned all action versions.
EOF
)"
```

### Step 5: Clean Up Canary

```bash
# After main workflows pass, remove canary
git rm .github/workflows/test-canary.yml
git commit --amend  # Add to previous commit
```

---

## 🚨 Mode 3 Override Workflow

**Use Case:** Need to modify runtime deps, root configs, or files outside Mode 0/1/2

### Step 1: Identify Override Need

```bash
# You've determined you need to modify:
# - Runtime dependencies (package.json dependencies)
# - Root config files (eslint.config.js, next.config.ts, etc.)
# - Non-text assets (images, fonts, binaries)
# - Or other denied files

# STOP: Do not proceed without approval
```

### Step 2: Research & Prepare Override Request

#### 2.1 Gather Evidence

```bash
# Document the problem
npm run build  # Show failure
npx tsc --noEmit  # Show errors

# Capture output
npm run build 2>&1 | tee build-error.log

# Identify exact failure points
# Example: "Cannot find module 'sharp'" at build:42
```

#### 2.2 Explore Options (Minimum 3)

```markdown
## Options Analysis

### Option 1: Add sharp + modify next.config.ts (Recommended)

**Pros:**

- Industry standard solution
- Fast implementation (~4 hours)
- Well-documented, maintained

**Cons:**

- Adds runtime dependency
- Requires root config change

**Est Diff:** ~95 lines, 3 files
**Risk:** Low

### Option 2: Use Cloudinary (External Service)

**Pros:**

- No code changes
- Managed service

**Cons:**

- $99/month cost
- Vendor lock-in
- Latency increase

**Est Diff:** ~50 lines, 2 files
**Risk:** Medium (vendor dependency)

### Option 3: Do Nothing

**Impact:**

- Page load stays slow (3.2MB images)
- Lighthouse score remains 45/100
- Poor user experience
- Potential customer loss
```

#### 2.3 Security/License Review

```bash
# Check package security
npm audit --package=sharp

# Check license
npm view sharp license
# Result: Apache-2.0 ✅

# Check maintenance status
npm view sharp time
# Last published: 2 weeks ago ✅

# Check popularity (indicator of reliability)
npm view sharp downloads
# Weekly downloads: 50M+ ✅
```

### Step 3: Submit Override Request (Use Template)

```markdown
🚨 OVERRIDE REQUEST (Mode 3 — Scoped)

Issue: #567 — Optimize product gallery images
Base ref: main

Why override is needed (≤5 lines):

- Product images currently 3.2MB raw PNGs, causing Lighthouse score 45/100
- Need `sharp` runtime dependency for server-side image optimization (WebP)
- Must modify next.config.ts to configure image domains and formats
- Cannot solve with Mode 0 (runtime dep + root config restrictions)

Options considered:

1. Add sharp + modify next.config.ts — Industry standard. ~95L, 3F. Low risk.
2. Use Cloudinary — No code but $99/mo + vendor lock-in.
3. Do nothing — Slow page load persists, poor UX.

Proposed plan (chosen option #1):

- Paths touched (exact, must be saved to PROPOSED_FILES.txt):
  - next.config.ts
  - package.json
  - package-lock.json
  - src/lib/imageOptimizer.ts (new)
  - src/components/ProductGallery.tsx
- Est diff: ~95 lines, 3 files (lockfile excluded)
- **Dependency change:** npm install sharp@^0.32.0
- **Security/License Check:** Apache-2.0, 0 CVEs, 50M+ weekly downloads
- **Versioning Preference:** Caret (^) - allow patch/minor updates
- Rollback: `git revert <sha>` (single commit)
- Tests added: tests/lib/imageOptimizer.test.ts
- Timebox: 4 hours

Evidence pack:

- Lighthouse audit: https://pagespeed.web.dev/report?url=example.com
- Current ProductGallery.tsx:45-67 uses raw <img> tags
- sharp documentation: https://sharp.pixelplumbing.com/
- Before: 3.2MB PNG, After (estimated): 280KB WebP

APPROVAL NEEDED:
Reply with: **APPROVE OVERRIDE: Mode 3 (Option 1)** and I'll proceed.
```

### Step 4: Wait for Approval (72-hour timeout)

#### 4.1 Monitor Request

- **Hour 24:** Send reminder if no response
- **Hour 48:** Escalate if urgent
- **Hour 72:** Auto-switch to Mode 4 if no response

#### 4.2 Handle Response

```
APPROVED_OVERRIDE: Mode 3 (Option 1)
→ Proceed to Step 5

DENIED: Reason provided
→ Return to Mode 0 with alternative approach

NO RESPONSE after 72 hours
→ Auto-switch to Mode 4 (Emergency Freeze)
```

### Step 5: Implement (After Approval)

#### 5.1 Save Approved File List

```bash
# Create PROPOSED_FILES.txt with approved paths
cat > PROPOSED_FILES.txt <<EOF
next.config.ts
package.json
package-lock.json
src/lib/imageOptimizer.ts
src/components/ProductGallery.tsx
EOF
```

#### 5.2 Implement Changes

```bash
# Make approved changes
npm install sharp@^0.32.0

# Edit approved files
# - next.config.ts
# - src/lib/imageOptimizer.ts (new)
# - src/components/ProductGallery.tsx
```

#### 5.3 Pre-Commit Guard (Critical!)

```bash
# Before committing, verify all staged files are approved
git diff --name-only | while read file; do
  if ! grep -q "^${file}$" PROPOSED_FILES.txt; then
    echo "❌ ERROR: $file not in approved list!"
    exit 1
  fi
done

# If check passes → safe to commit
# If check fails → remove unapproved file from staging
```

### Step 6: Commit & PR (Mode 3 Template)

```bash
git commit -m "$(cat <<'EOF'
feat: add product image optimization (Fixes #567)

Mode: 3 (Scoped Override - Approved)
Approval: @tech-lead on 2025-10-14
RCA: Product gallery served unoptimized 3.2MB PNGs causing Lighthouse 45/100.
No existing optimization pipeline. Required runtime dep and config modification.
Fix: Added sharp for server-side WebP conversion, configured next.config.ts
with image domains, updated ProductGallery to use next/image.
Files: next.config.ts, package.json, src/lib/imageOptimizer.ts, ProductGallery.tsx
Tests: tests/lib/imageOptimizer.test.ts
EOF
)"
```

---

## 🧊 Emergency Freeze Workflow

**Use Case:** Mode 4 when risk is high, impact unknown, or work is stalled

### Triggers for Mode 4

**Auto-Triggers:**

1. Mode 3 request timeout (72 hours, no response)
2. Stale PR (10 days, no human interaction)

**Manual Triggers:** 3. Security vulnerability discovered 4. Architecture decision needed 5. Unclear requirements 6. High-risk change with unknown impact 7. Merge conflict too complex to resolve

### Step 1: Stop All Work Immediately

```bash
# Do NOT make any more changes
# Do NOT commit anything
# Switch focus to documentation
```

### Step 2: Document Current State

#### 2.1 What's Complete

```markdown
## Work Completed (%)

- [x] Research and planning (100%)
- [x] Baseline checks (100%)
- [~] Implementation (40% - PAUSED)
- [ ] Testing (0% - NOT STARTED)
- [ ] Documentation (0% - NOT STARTED)
```

#### 2.2 What's Blocked

```markdown
## Blocked By

**Primary Blocker:** Architectural decision required

**Context:**
Implementing user permissions system (Issue #789). Two viable approaches:

1. **RBAC (Role-Based Access Control)**
   - Simpler, faster to implement
   - Less flexible for future requirements
   - Industry standard for simple use cases

2. **ABAC (Attribute-Based Access Control)**
   - More complex, slower initial development
   - Highly flexible, future-proof
   - Better for complex permission rules

**Decision Needed:** Which architecture aligns with product roadmap?
```

### Step 3: Assess Risk

```markdown
## Risk Assessment

**If we proceed with RBAC:**

- Risk: Major refactor needed later if requirements expand
- Timeline Impact: Weeks of rework
- Cost: High technical debt

**If we proceed with ABAC:**

- Risk: Over-engineering if requirements stay simple
- Timeline Impact: 2x development time now
- Cost: Slower initial delivery

**If we do nothing:**

- Impact: User permissions feature blocked
- Business Impact: Launch delayed, competitive disadvantage
```

### Step 4: What's Been Tried

```markdown
## Attempted Solutions

**Attempt 1:** Implemented RBAC spike (2 hours)

- Result: Works, but inflexible
- Conclusion: Fast but limiting

**Attempt 2:** Implemented ABAC spike (3 hours)

- Result: Flexible, but complex
- Conclusion: Future-proof but slow

**Attempt 3:** Researched industry standards

- Result: Both used, context-dependent
- Conclusion: No clear "best" answer without product context
```

### Step 5: Request Direction (Use Template)

```markdown
🧊 EMERGENCY FREEZE (Mode 4)

Issue: #789 — Implement user permissions system
Trigger: Architectural decision required

**Current Status:**

- Work completed: 30% (research and spikes)
- Blocked by: Choice between RBAC vs ABAC architectures
- Risk level: High (wrong choice = major refactor later)

**What's Been Tried:**

1. Spike: RBAC prototype (2 hours) — Works, but inflexible
2. Spike: ABAC prototype (3 hours) — Flexible, but complex
3. Researched: Industry standards — Both used, context-dependent

**Information Needed:**

- What's the product roadmap for permissions? (Simple or complex rules?)
- Performance requirements? (ABAC can be slower)
- Team expertise? (ABAC has steeper learning curve)

**Risk Assessment:**

- If we choose RBAC: Fast now, costly refactor later if needs expand
- If we choose ABAC: Slower now, over-engineered if needs stay simple
- If we do nothing: Feature blocked, launch delayed

**Recommended Next Steps:**

1. Product owner clarifies: complexity of future permission rules
2. Stakeholder decision: optimize for speed vs flexibility
3. Once decided, return to Mode 0 with chosen approach

**Requesting:** Immediate human direction to proceed.
```

### Step 6: Wait for Human Direction

**Possible Responses:**

**PROCEED_WITH_MODE_0 + Direction:**

```
"Choose RBAC, optimize for speed. We'll refactor if needed."
→ Exit Mode 4, return to Mode 0 with RBAC approach
```

**ABANDON_WORK:**

```
"Deprioritized. Close issue as won't-fix."
→ Close PR, move to next task
```

**REASSIGN:**

```
"Too complex for agent. Assigning to senior engineer."
→ Hand off with full context documentation
```

---

## ✅ Fix Verification Workflow

**Use Case:** Mandatory final check after PR opened, before handoff

**Full details:** See [VERIFICATION_CHECKLIST.md](./VERIFICATION_CHECKLIST.md)

### Quick Verification Steps

#### 1. Core Fix Verification

```bash
# Reproduce original issue
# Confirm fix resolves it
# Check edge cases

# Evidence:
git log -1  # Show fix commit
npm test -- <test-file>  # Show passing test
```

#### 2. Policy Compliance

```bash
# Verify mode compliance
git diff main --name-only  # List modified files
# Compare to mode allowlist

# Verify diff budget
git diff main --stat  # Check lines/files
```

#### 3. Quality Gates

```bash
# All must pass
npm run lint -- --max-warnings=0
npx tsc --noEmit
npm test -- --runInBand
npm run build
```

#### 4. Clean Artifacts

```bash
# Check for debug code
git diff main | grep -E '(console\.log|debugger)'
# Must return empty

# Check for TODOs
git diff main | grep -E 'TODO|FIXME'
# All must have issue numbers or be removed
```

#### 5. Generate Verification Report

```markdown
✅ VERIFICATION STATUS: PASS

---

### 🧪 Fix Audit for Issue #123

**Original Goal:** Fix email validation bypass

**1. Core Fix Status:**

- Issue Resolved: PASS — Special chars now rejected
- New Test Added: YES — tests/auth/validator.test.ts
- Docs Updated: N/A — Internal function, no public API change
- Error Paths Validated: PASS — Invalid emails return clear errors

**2. Policy & Regression Status:**

- Policy Mode Used: Mode 0 — Files: validator.ts, validator.test.ts
- Linter/TS Check: PASS — 0 warnings, 0 errors
- Full Test Suite: PASS — 49 tests, 0 failures
- Deployment Build: PASS — Build succeeded
- Operational Readiness: PASS — No new env vars

**3. Architectural & Clean-Up Status:**

- Clean Artifacts: PASS — 0 console.logs, 0 debug code
- Dependency Audit: PASS — No dependencies added
- Architectural Adherence: PASS
- Simplicity Audit: PASS — No new complexity

**4. Next Step:**
✅ PR is ready for human review. Setting status to "Ready for Review".
```

---

## 📚 Workflow Quick Reference

| Scenario                 | Mode | Workflow                                      |
| ------------------------ | ---- | --------------------------------------------- |
| Normal bug/feature       | 0    | [Standard](#standard-featurebug-workflow)     |
| Small cleanup (no issue) | 0.5  | [Refactor](#self-initiated-refactor-workflow) |
| Baseline tests broken    | 1    | [LTRM](#ltrm-workflow-local-tooling-repair)   |
| CI workflows broken      | 2    | [CI Repair](#ci-repair-workflow)              |
| Need restricted files    | 3    | [Override](#mode-3-override-workflow)         |
| High risk/uncertain      | 4    | [Freeze](#emergency-freeze-workflow)          |
| After PR opened          | N/A  | [Verification](#fix-verification-workflow)    |

---

## 🔗 Related Documentation

- [Quick Start](./QUICK_START.md) - 5-minute overview
- [Mode Reference](./MODE_REFERENCE.md) - Detailed mode rules
- [Templates](./TEMPLATES.md) - All templates
- [Verification Checklist](./VERIFICATION_CHECKLIST.md) - Final audit steps
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues
- [Examples](./EXAMPLES.md) - Real-world scenarios
