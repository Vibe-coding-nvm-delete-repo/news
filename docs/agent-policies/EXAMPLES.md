# 📚 Examples & Case Studies - Real-World Scenarios

**Purpose:** Concrete examples of how to apply the autonomous agent policy in practice.

---

## 🎯 Example Index

**By Mode:**
- [Mode 0 Examples](#mode-0-examples-normal)
- [Mode 0.5 Examples](#mode-05-examples-refactor)
- [Mode 1 Examples](#mode-1-examples-ltrm)
- [Mode 2 Examples](#mode-2-examples-ci-repair)
- [Mode 3 Examples](#mode-3-examples-scoped-override)
- [Mode 4 Examples](#mode-4-examples-emergency-freeze)

**By Scenario Type:**
- [Bug Fixes](#bug-fix-scenarios)
- [New Features](#feature-scenarios)
- [Technical Debt](#technical-debt-scenarios)
- [Emergency Situations](#emergency-scenarios)

---

## 🔢 Mode 0 Examples (Normal)

### Example 1: Simple Bug Fix - Email Validation

**Issue #123:** Users can bypass email validation with special characters

**Scenario:**
```typescript
// Current buggy code in src/auth/validator.ts
export function validateEmail(email: string): boolean {
  const regex = new RegExp(`^${email}@`);  // BUG: Not escaping input
  return regex.test(email);
}
```

**Solution Approach:**
```bash
# 1. Branch
git switch -c ai/123-fix-email-validation-202510151430 main

# 2. Baseline checks
npm ci && npm test  # ✅ All pass

# 3. Files to modify (Mode 0 - all allowed):
- src/auth/validator.ts (fix bug)
- tests/auth/validator.test.ts (add regression test)

# 4. Implementation
```

```typescript
// Fixed: src/auth/validator.ts
export function validateEmail(email: string): boolean {
  const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`^${escapedEmail}@`);
  return regex.test(email);
}

// Added: tests/auth/validator.test.ts
describe('validateEmail', () => {
  it('should reject emails with special regex chars', () => {
    expect(validateEmail('admin@[localhost]')).toBe(false);
    expect(validateEmail('user@domain.*')).toBe(false);
  });
});
```

**Commit:**
```bash
git commit -m "fix: email validation bypass (Fixes #123)

Mode: 0
RCA: Regex in validator.ts was not escaping special chars from user input,
allowing crafted emails like 'admin@[localhost]' to bypass validation.
This occurred because String() was used directly in RegExp constructor,
enabling potential XSS via email injection.
Minimal fix: Added escapeRegex() to sanitize input before regex creation.
Tests: tests/auth/validator.test.ts"
```

**Diff Stats:**
- Lines: 45
- Files: 2
- Budget: ✅ 300L/4F

---

### Example 2: New Feature - Add Dark Mode Toggle

**Issue #234:** Add dark mode toggle to user settings

**Scenario:**
User wants to toggle between light/dark themes.

**Files Modified (all Mode 0 allowed):**
```
src/components/SettingsPanel.tsx    (add toggle UI)
src/contexts/ThemeContext.tsx       (add theme state)
src/styles/themes.ts                (define theme variables)
tests/components/SettingsPanel.test.tsx
```

**Implementation Approach:**
1. Add theme context with state
2. Create toggle component
3. Apply theme classes to root
4. Add persistence to localStorage

**Commit:**
```bash
git commit -m "feat: add dark mode toggle (Fixes #234)

Mode: 0
RCA: Users requested ability to switch between light/dark themes for
accessibility and preference. No existing theme system. Added context-based
theme provider with localStorage persistence.
Minimal fix: Created ThemeContext, added toggle in SettingsPanel, defined
CSS variables for both themes.
Tests: tests/components/SettingsPanel.test.tsx"
```

**Diff Stats:**
- Lines: 185
- Files: 4
- Budget: ✅ 300L/4F

---

## 🔧 Mode 0.5 Examples (Refactor)

### Example 3: Remove Dead Code

**Scenario:** No issue exists, but noticed unused utility functions during code review.

**Files to Clean:**
```
src/utils/date.ts  (remove 3 unused functions)
```

**Implementation:**
```bash
# Check usage
rg "formatDateLong|formatDateShort|parseISODate" src/

# Result: No matches (unused)

# Remove functions
# Edit src/utils/date.ts: Delete lines 45-92 (3 functions)
```

**Commit:**
```bash
git commit -m "refactor: remove unused date utilities

Mode: 0.5 (Self-Initiated)
Cleanup benefit: Removed formatDateLong, formatDateShort, and parseISODate
utilities that haven't been used in 8+ months (per git blame). Reduces
bundle size by ~1.2KB and cognitive load.
Impact: src/utils/date.ts (47 lines removed)"
```

**PR Note:**
```markdown
## Mode 0.5 Self-Initiated Refactor

**Justification:** Spotted during work on Issue #234
**Benefit:** Bundle size reduction, less code to maintain
**Scope:** 47 lines, 1 file (within 50L/2F budget)
```

**Diff Stats:**
- Lines: 47
- Files: 1
- Budget: ✅ 50L/2F

---

### Example 4: Type Cleanup - NON-EXAMPLE (Too Large for 0.5)

**Scenario:** Want to improve type safety across authentication module.

**Proposed Changes:**
```
src/auth/types.ts           (add strict types)
src/auth/login.ts           (use new types)
src/auth/register.ts        (use new types)
src/auth/validator.ts       (use new types)
tests/auth/types.test.ts    (add tests)
```

**Decision:**
❌ **Cannot use Mode 0.5** - Exceeds budget:
- 5 files (limit: 2)
- ~120 lines (limit: 50)

**Correct Approach:**
✅ Create Issue #567: "Improve auth module type safety"
✅ Use Mode 0 with proper issue

---

## 🛠️ Mode 1 Examples (LTRM)

### Example 5: Jest Cannot Parse TypeScript

**Issue #345:** Test suite fails with syntax errors

**Baseline Check:**
```bash
npm ci
npm test

# Output:
# SyntaxError: Unexpected token 'export'
# at src/auth/validator.ts:1:1
```

**Root Cause:** Jest not configured for TypeScript

**Files Modified (Mode 1 temporarily allowed):**
```
jest.config.js       (add ts-jest transformer)
package.json         (add ts-jest devDependency)
package-lock.json    (auto-generated)
```

**Implementation:**
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',  // Added
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

```json
// package.json (devDependencies only)
{
  "devDependencies": {
    "ts-jest": "^29.1.0"  // Added (ONE devDep allowed)
  }
}
```

**Commit:**
```bash
git commit -m "fix: jest unable to parse TypeScript (Fixes #345)

Mode: 1 (LTRM)
RCA: Jest was failing with 'SyntaxError: Unexpected token export' on all
TypeScript test files. Root cause: jest.config.js missing ts-jest transformer
after upgrading to TypeScript 5.x which changed module resolution. Baseline
confirmed pre-existing failure.
Minimal fix: Added ts-jest@29.1.0 devDep and preset in jest.config.js.
Tests: Full test suite now passes (npm test)"
```

**Verification:**
```bash
npm test  # ✅ All tests pass
```

**Diff Stats:**
- Lines: 18 (excluding lockfile)
- Files: 2 (jest.config.js, package.json)
- Budget: ✅ 120L/2F

---

## 🔄 Mode 2 Examples (CI Repair)

### Example 6: GitHub Actions Node Version Outdated

**Issue #456:** CI failing with "Node 16 is deprecated"

**Baseline CI Check:**
```yaml
# .github/workflows/test.yml (current, broken)
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3  # Deprecated
      - uses: actions/setup-node@v3
        with:
          node-version: 16  # Deprecated
```

**Solution (Mode 2):**
```yaml
# .github/workflows/test.yml (fixed)
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4.1.0  # Pinned version
      - uses: actions/setup-node@v4.0.0  # Pinned version
        with:
          node-version: 20  # Updated to LTS
```

**Commit:**
```bash
git commit -m "fix: update deprecated GitHub Actions (Fixes #456)

Mode: 2 (CI_REPAIR)
RCA: GitHub Actions workflow was failing due to deprecated actions/checkout@v3
and Node 16 (EOL 2024-09-11). GitHub auto-deprecated unpinned v3 references.
Minimal fix: Updated to checkout@v4.1.0 and setup-node@v4.0.0 with Node 20.
Protocol: Tested in canary workflow first, pinned all action versions."
```

**Diff Stats:**
- Lines: 8
- Files: 1
- Budget: ✅ Minimal (CI repair)

---

## 🚨 Mode 3 Examples (Scoped Override)

### Example 7: Add Runtime Dependency - Image Optimization

**Issue #567:** Product gallery images too large, slow page load

**Why Mode 3:**
- Need to add `sharp` runtime dependency
- Modify `next.config.ts` (root config)
- Both are denied in Mode 0

**Override Request:**
```markdown
🚨 OVERRIDE REQUEST (Mode 3 — Scoped)

Issue: #567 — Optimize product gallery images
Base ref: main

Why override is needed (≤5 lines):
- Product images currently 3.2MB raw PNGs, Lighthouse score 45/100
- Need `sharp` for server-side image optimization (WebP conversion)
- Must modify next.config.ts to configure image domains and formats
- Cannot solve with Mode 0 (runtime dep + root config restrictions)

Options considered:
1) Add sharp + modify next.config.ts — Industry standard, fast. ~95 lines, 3 files. Low risk.
2) Use Cloudinary (external) — No code but $99/mo + vendor lock-in. 
3) Client-side compression — Poor UX (slow initial load), ~200 lines, complex.

Proposed plan (chosen option #1):
- Paths touched (exact, must be saved to PROPOSED_FILES.txt):
  - next.config.ts
  - package.json
  - package-lock.json
  - src/lib/imageOptimizer.ts (new)
  - src/components/ProductGallery.tsx
- Est diff: ~95 lines, 3 files (lockfile excluded)
- **Dependency change:** npm install sharp@^0.32.0
- **Security/License Check:** Apache-2.0 license, 0 CVEs, 50M+ weekly downloads
- **Versioning Preference:** Caret (^) - allow patch/minor updates
- Rollback: `git revert <sha>` (single commit)
- Tests added: tests/lib/imageOptimizer.test.ts
- Timebox: 4 hours

Evidence pack:
- Lighthouse audit: https://pagespeed.web.dev/report?url=...
- Current ProductGallery.tsx:45-67 uses raw <img> tags
- sharp docs: https://sharp.pixelplumbing.com/
- Before: 3.2MB PNG, After (estimated): 280KB WebP

APPROVAL NEEDED:
Reply with: **APPROVE OVERRIDE: Mode 3 (Option 1)** and I'll proceed.
```

**After Approval:**
```bash
# Save approved files
echo "next.config.ts
package.json
package-lock.json
src/lib/imageOptimizer.ts
src/components/ProductGallery.tsx" > PROPOSED_FILES.txt

# Implement changes
npm install sharp@^0.32.0

# Pre-commit guard
git diff --name-only | while read file; do
  grep -q "$file" PROPOSED_FILES.txt || {
    echo "❌ $file not in approved list!"
    exit 1
  }
done
```

**Commit:**
```bash
git commit -m "feat: add product image optimization (Fixes #567)

Mode: 3 (Scoped Override - Approved)
Approval: @tech-lead on 2025-10-14
RCA: Product gallery served unoptimized 3.2MB PNGs causing Lighthouse 45/100.
No existing optimization pipeline. Required runtime dep and config modification.
Minimal fix: Added sharp for server-side WebP conversion, configured
next.config.ts with image domains, updated ProductGallery to use next/image.
Files: next.config.ts, package.json, src/lib/imageOptimizer.ts, ProductGallery.tsx
Tests: tests/lib/imageOptimizer.test.ts"
```

**Diff Stats:**
- Lines: 95
- Files: 3 (excluding lockfile)
- Approved: ✅ Mode 3

---

### Example 8: Add Brand Assets (Images)

**Issue #678:** Add company logo and favicon

**Why Mode 3:**
- Non-text assets (logo.png, favicon.ico)
- Policy requires Mode 3 for binaries

**Override Request:**
```markdown
🚨 OVERRIDE REQUEST (Mode 3 — Scoped)

Issue: #678 — Add brand assets (logo and favicon)
Base ref: main

Why override is needed (≤5 lines):
- Need to add logo.png (5KB) and favicon.ico (2KB) binary files
- Policy prohibits non-text assets in Modes 0/1/2
- Assets are essential for brand identity in production launch

Options considered:
1) Add assets to public/ directory — Standard Next.js practice. 2 files, 7KB total. No code changes.
2) Use external CDN — Requires Mode 3 anyway (config changes) + adds latency.
3) Inline SVG — Logo is raster (client requirement), not vectorizable.

Proposed plan (chosen option #1):
- Paths touched (exact, must be saved to PROPOSED_FILES.txt):
  - public/logo.png
  - public/favicon.ico
- Est diff: N/A (binary assets, not counted in line budget)
- **Dependency change:** N/A
- **Security/License Check:** Company-owned assets, no external licenses
- **Versioning Preference:** N/A
- Rollback: `git revert <sha>`
- Tests added: N/A (visual assets)
- Timebox: 30 minutes

Evidence pack:
- Assets provided by design team (internal)
- File sizes: logo.png (5.2KB), favicon.ico (1.8KB)
- Total repo size impact: +7KB (negligible)

APPROVAL NEEDED:
Reply with: **APPROVE OVERRIDE: Mode 3 (Option 1)** and I'll proceed.
```

---

## 🧊 Mode 4 Examples (Emergency Freeze)

### Example 9: Uncertain Architecture Decision

**Issue #789:** Implement user permissions system

**Scenario:**
Started implementing, realized two viable approaches with major trade-offs:

**Approach A:** Role-based (RBAC)
- Simpler, faster
- Less flexible for future requirements

**Approach B:** Attribute-based (ABAC)
- More complex, slower initial development
- Highly flexible, future-proof

**Decision: Switch to Mode 4**

**Report:**
```markdown
🧊 EMERGENCY FREEZE (Mode 4)

Issue: #789 — Implement user permissions system
Trigger: Architectural decision required

**Current Status:**
- Work completed: 30% (initial research and spike)
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

**Resolution:**
Human responds: "Choose RBAC, optimize for speed. We'll refactor if needed."
→ Return to Mode 0 with RBAC approach

---

### Example 10: Stale Override Request (Auto Mode 4)

**Issue #890:** Add analytics tracking

**Timeline:**
- Day 1 (Oct 1): Submit Mode 3 Override request
- Day 2 (Oct 2): Ping reviewer
- Day 3 (Oct 3): No response
- Day 4 (Oct 4): Auto-switch to Mode 4 (72hr timeout)

**Auto-Generated Report:**
```markdown
🧊 EMERGENCY FREEZE (Mode 4) - AUTO-TRIGGERED

Issue: #890 — Add analytics tracking
Trigger: Override request timeout (72 hours)

**Current Status:**
- Work completed: 0% (blocked at planning stage)
- Blocked by: Mode 3 Override request awaiting approval since 2025-10-01
- Risk level: Low (no changes made yet)

**Override Request Summary:**
- Requested: npm install @segment/analytics-next
- Reason: Analytics required for product launch
- Submitted: 2025-10-01 14:30
- Reminder sent: 2025-10-02 10:15
- No response as of: 2025-10-04 14:30 (72hr timeout)

**Per Stale Work Policy:**
Auto-switched to Mode 4 per 72-hour timeout rule.

**Recommended Next Steps:**
1. Re-ping approval stakeholders
2. Escalate to engineering lead if still no response
3. Consider: Is this issue still priority? (10 days since creation)

**Requesting:** Immediate human triage.
```

---

## 🔍 Bug Fix Scenarios

### Example 11: Critical Production Bug

**Issue #901:** Password reset emails not sending (P0)

**Mode Selection:**
```bash
# 1. Check baseline
npm test  # ✅ Pass (not a tooling issue)

# 2. Check files needed
src/services/email.ts         # ✅ Mode 0 allowed
src/api/reset-password.ts     # ✅ Mode 0 allowed
tests/services/email.test.ts  # ✅ Mode 0 allowed

# Decision: Mode 0 (all files in allowlist)
```

**RCA:**
SMTP configuration was using wrong port (587 instead of 465 for SSL).

**Fix:**
```typescript
// src/services/email.ts
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,  // Changed from 587
  secure: true,
  auth: { ... }
});
```

**Commit:**
```bash
git commit -m "fix: password reset emails not sending (Fixes #901)

Mode: 0
RCA: SMTP transporter configured with port 587 (STARTTLS) but secure: true
requires port 465 (implicit TLS). Mismatch caused connection timeout. Occurred
after hosting provider updated SSL/TLS policy on 2025-10-10.
Minimal fix: Changed port from 587 to 465 in email.ts transporter config.
Tests: tests/services/email.test.ts (added SMTP connection test)"
```

---

## 🎨 Feature Scenarios

### Example 12: Large Feature - Multi-Step Approach

**Issue #1000:** Implement full shopping cart system

**Initial Analysis:**
- Estimated: 800 lines, 12 files
- Budget: 300 lines, 4 files ❌ WAY OVER

**Correct Approach: Decompose**

**Sub-Issues Created:**
```
#1000a: Shopping cart data model (150L, 3F) - Mode 0
  - src/models/Cart.ts
  - src/types/cart.ts
  - tests/models/Cart.test.ts

#1000b: Cart API endpoints (200L, 4F) - Mode 0
  - src/api/cart/add.ts
  - src/api/cart/remove.ts
  - src/api/cart/update.ts
  - tests/api/cart.test.ts

#1000c: Cart UI components (180L, 3F) - Mode 0
  - src/components/CartIcon.tsx
  - src/components/CartDrawer.tsx
  - tests/components/Cart.test.tsx

#1000d: Cart persistence (120L, 2F) - Mode 0
  - src/hooks/useCart.ts
  - tests/hooks/useCart.test.ts
```

**Each sub-issue:**
- Within Mode 0 budget ✅
- Independent and testable ✅
- Clear acceptance criteria ✅

---

## 📋 Technical Debt Scenarios

### Example 13: Continuous Improvement - New Issue Proposal

**Current Task:** Fixing Issue #1100 (login bug)

**During Implementation, Noticed:**
- Auth module has no error logging
- Would help debug future issues
- Outside current issue scope

**Action: Document in PR**

**PR Body Includes:**
```markdown
## 💡 New Issue Proposals (Technical Debt Identified)

### Proposal 1: Add Error Logging to Auth Module
**Scope:** Add structured logging for all authentication failures and edge cases
**Justification:** During debugging of #1100, lack of logs made root cause
identification difficult. Structured logs would reduce MTTR for future auth issues.
**Estimated Complexity:** Medium (120 lines, 4 files - auth/login, auth/register,
auth/validator, plus logger config)
**Mode Required:** Mode 0 (no restricted files)
**Suggested Priority:** P2 (Nice-to-have, not blocking)
**Estimated Effort:** 3 hours

**Note:** Not implemented in this PR to maintain scope of #1100.
```

**Result:** Issue #1150 created by human after reviewing PR

---

## 🚨 Emergency Scenarios

### Example 14: Security Vulnerability Discovered

**Scenario:** While fixing Issue #1200, discovered SQL injection vulnerability.

**Immediate Action:**
```markdown
🧊 EMERGENCY FREEZE (Mode 4)

Issue: #1200 — Add user search feature
Trigger: Security vulnerability discovered

**SECURITY ALERT:**
While implementing user search, discovered SQL injection vulnerability in
existing src/api/users/search.ts:23

```typescript
// VULNERABLE CODE (DO NOT USE):
const query = `SELECT * FROM users WHERE name = '${req.query.name}'`;
```

**Current Status:**
- Work on #1200: PAUSED
- Vulnerability: EXISTS IN PRODUCTION
- Risk level: HIGH (data breach potential)

**Immediate Actions Taken:**
1. Stopped all work on #1200
2. Documented vulnerable code location
3. Switching to Mode 4
4. Flagging for immediate security review

**Recommended Next Steps:**
1. URGENT: Patch production immediately (prepared fix available)
2. Create P0 security issue
3. Notify security team
4. Resume #1200 after patch

**Requesting:** IMMEDIATE security team response.
```

**DO NOT:**
- Fix the vulnerability yourself without review
- Continue with original issue
- Commit any changes to vulnerable code

---

## 📚 Related Documentation

- [Mode Reference](./MODE_REFERENCE.md) - Detailed mode rules
- [Quick Start](./QUICK_START.md) - Basic workflows
- [Templates](./TEMPLATES.md) - Copy/paste formats
- [Troubleshooting](./TROUBLESHOOTING.md) - Problem solutions
