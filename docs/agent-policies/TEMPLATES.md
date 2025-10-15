# 📝 Templates - Copy/Paste Reference

**Purpose:** Standardized templates for all agent communications, commits, and requests.

---

## 🚨 Mode 3 Override Request Template

**When to use:** Before touching runtime deps, root configs, or files outside Mode 0/1/2 allowlists.

```markdown
🚨 OVERRIDE REQUEST (Mode 3 — Scoped)

Issue: #<NUM> — <TITLE>
Base ref: <ref/branch>

Why override is needed (≤5 lines):
- [What's blocked, by what constraint, and why lesser modes are insufficient]

Options considered:
1) <Option A: minimal scope> — Pros/Cons, Est lines/files, Risk
2) <Option B: alt> — Pros/Cons, Est lines/files, Risk
3) <Option C: do nothing> — Impact

Proposed plan (chosen option):
- Paths touched (exact, must be saved to PROPOSED_FILES.txt): [files]
- Est diff: ~<lines>, <files> (Note: Diff budget applies to code/text; non-text assets are reviewed case-by-case)
- **Dependency change:** [npm install/update/remove, or N/A]
- **Security/License Check:** [brief summary of security review or N/A]
- **Versioning Preference:** [State preference: Caret (^), Tilde (~), or Pinned version]
- Rollback: `git revert <sha>` (single commit)
- Tests added: [file]
- Timebox: <N> hours

Evidence pack:
- Repro commands + outputs (tsc/test/build)
- Exact failing lines (file:line)
- Links (logs/builds)

APPROVAL NEEDED:
Reply with: **APPROVE OVERRIDE: Mode 3 (Option X)** and I'll proceed.
```

### Example - Filled Template

```markdown
🚨 OVERRIDE REQUEST (Mode 3 — Scoped)

Issue: #456 — Add image optimization for product gallery
Base ref: main

Why override is needed (≤5 lines):
- Product gallery requires WebP conversion and CDN integration
- Needs `next-image-optimizer` runtime dependency
- Must modify `next.config.ts` to configure image domains
- Cannot be solved with Mode 0 (root config restriction)

Options considered:
1) Add next-image-optimizer + modify next.config.ts — Fast, proven solution. ~85 lines, 3 files. Low risk (well-documented).
2) Build custom image pipeline — More control but ~400 lines, 8 files. High complexity, weeks of work.
3) Use external service (Cloudinary) — Zero code but monthly cost + vendor lock-in.

Proposed plan (chosen option #1):
- Paths touched (exact, must be saved to PROPOSED_FILES.txt):
  - next.config.ts
  - package.json
  - package-lock.json
  - src/components/ProductGallery.tsx
- Est diff: ~85 lines, 3 files (lockfile excluded from count)
- **Dependency change:** npm install next-image-optimizer@^2.1.0
- **Security/License Check:** MIT license, 0 CVEs, actively maintained (last release 2 weeks ago)
- **Versioning Preference:** Caret (^) - allow patch/minor updates
- Rollback: `git revert <sha>` (single commit)
- Tests added: tests/components/ProductGallery.test.tsx
- Timebox: 3 hours

Evidence pack:
- Repro: Current images load as raw PNG (3.2MB each), lighthouse score 45/100
- Current ProductGallery.tsx:142-156 uses <img> instead of <Image>
- Build logs: https://vercel.com/build/abc123
- Next.js docs: https://nextjs.org/docs/api-reference/next/image

APPROVAL NEEDED:
Reply with: **APPROVE OVERRIDE: Mode 3 (Option 1)** and I'll proceed.
```

---

## 💬 Commit Message Templates

### Standard Commit (Mode 0)

```
fix: <short-name> (Fixes #<ISSUE_NUMBER>)

Mode: 0
RCA: <3-5 line root cause analysis>
Minimal fix: <1-2 line description of the change>
Tests: <test file path>
```

**Example:**
```
fix: login validation bypass (Fixes #789)

Mode: 0
RCA: The email validation regex in src/auth/validator.ts was not escaping
special characters, allowing emails like "admin@[localhost]" to bypass
validation. This occurred because the regex used String() instead of escaping
input, enabling potential XSS via crafted email addresses.
Minimal fix: Added regex escaping via escapeRegex() helper in validator.ts.
Tests: tests/auth/validator.test.ts
```

### Refactor Commit (Mode 0.5)

```
refactor: <short-name>

Mode: 0.5 (Self-Initiated)
Cleanup benefit: <1-2 line justification>
Impact: <affected files/functions>
```

**Example:**
```
refactor: remove unused utility functions

Mode: 0.5 (Self-Initiated)
Cleanup benefit: Removed 3 unused date formatting helpers (last used 8mo ago
per git blame), reducing bundle size by ~1.2KB and cognitive load.
Impact: src/utils/date.ts, src/utils/format.ts (45 lines removed)
```

### LTRM Commit (Mode 1)

```
fix: <short-name> (Fixes #<ISSUE_NUMBER>)

Mode: 1 (LTRM)
RCA: <3-5 line root cause analysis of tooling failure>
Minimal fix: <1-2 line description>
Tests: <test file path>
```

**Example:**
```
fix: jest unable to parse TypeScript (Fixes #234)

Mode: 1 (LTRM)
RCA: Jest was failing with "SyntaxError: Unexpected token 'export'" when
running tests. Root cause: jest.config.js was missing the ts-jest transformer.
This occurred after upgrading to TypeScript 5.x which changed module resolution.
Baseline tests confirmed this was a pre-existing issue.
Minimal fix: Added ts-jest devDependency and configured preset in jest.config.js.
Tests: Baseline test suite now passes (npm test)
```

### CI Repair Commit (Mode 2)

```
fix: <workflow-name> workflow broken (Fixes #<ISSUE_NUMBER>)

Mode: 2 (CI_REPAIR)
RCA: <3-5 line root cause>
Fix: <1-2 line description>
Protocol: <canary/pinned versions/etc>
```

**Example:**
```
fix: test workflow broken (Fixes #345)

Mode: 2 (CI_REPAIR)
RCA: GitHub Actions workflow test.yml was failing with "actions/checkout@v3
not found". Root cause: GitHub deprecated v3 on 2025-10-01. Workflow was
using unpinned version reference that auto-upgraded but v4 requires different
node version.
Fix: Pinned actions/checkout@v4.1.0 and updated node-version to 20.x.
Protocol: Tested in canary workflow first, pinned all action versions.
```

### Scoped Override Commit (Mode 3)

```
<type>: <short-name> (Fixes #<ISSUE_NUMBER>)

Mode: 3 (Scoped Override - Approved)
Approval: <approver> on <date>
RCA: <3-5 line root cause>
Fix: <1-2 line description>
Files: <list of modified files from PROPOSED_FILES.txt>
Tests: <test file path>
```

**Example:**
```
feat: add product image optimization (Fixes #456)

Mode: 3 (Scoped Override - Approved)
Approval: @tech-lead on 2025-10-14
RCA: Product gallery was serving unoptimized 3.2MB PNG images, causing
lighthouse score of 45/100. No existing optimization pipeline. Required
runtime dependency and root config modification.
Fix: Added next-image-optimizer, configured in next.config.ts, updated
ProductGallery component to use <Image> with WebP conversion.
Files: next.config.ts, package.json, src/components/ProductGallery.tsx
Tests: tests/components/ProductGallery.test.tsx
```

---

## 📄 Pull Request Body Template

### Standard PR (Mode 0 or 0.5)

```markdown
## Summary
Fixes #<ISSUE_NUMBER> — <Brief description>

## Changes
- <Change 1>
- <Change 2>
- <Change 3>

## Root Cause Analysis
<3-5 lines explaining why the bug occurred or why the feature was needed>

## How to Verify
1. <Step 1>
2. <Step 2>
3. Expected result: <outcome>

## Tests Added/Modified
- `<test-file-path>`: <what it tests>

## Risks & Limitations
- <Risk 1 or "None identified">
- <Limitation 1 or "None">

## 🧩 Conformance
- **Policy Mode:** Mode <0|0.5|1|2|3>
- **Reason:** <why this mode was used>
- **Diff:** <X> lines, <Y> files (Budget: 300L/4F)
- **Standards:** Verified per ENGINEERING_STANDARDS.md (if exists)

## Acceptance Criteria
- ✅ `npm run lint -- --max-warnings=0`
- ✅ `npx tsc --noEmit`
- ✅ `npm test -- --runInBand`
- ✅ `npm run build`
- ✅ Behavior verified (see steps above)
- ✅ No scope creep
```

### PR with New Issue Proposals (Continuous Improvement)

```markdown
## Summary
Fixes #<ISSUE_NUMBER> — <Brief description>

<... standard sections ...>

## 🧩 Conformance
<... standard conformance ...>

## 💡 New Issue Proposals (Technical Debt Identified)

While implementing this fix, the following improvement opportunities were identified:

### Proposal 1: <Short Title>
**Scope:** <1-2 lines describing the change>
**Justification:** <Why this matters - performance, maintainability, etc.>
**Estimated Complexity:** <Low/Medium/High> (<X> lines, <Y> files)
**Mode Required:** <Mode 0 or Mode 3>
**Suggested Priority:** <P1/P2/P3>

### Proposal 2: <Short Title>
<... same structure ...>

**Note:** These were NOT implemented in this PR to maintain scope. Requesting review/triage.
```

---

## 📊 Verification Checklist Output Template

**When to use:** After implementing a fix, before final PR handoff.

```markdown
✅ VERIFICATION STATUS: [PASS or FAIL]

---
### 🧪 Fix Audit for Issue #[ISSUE_NUMBER]

**Original Goal:** [Copy the original acceptance criteria or PQA summary]

**1. Core Fix Status:**
* Issue Resolved: [PASS/FAIL] — [Evidence/Confirmation]
* New Test Added: [YES/NO] — [File reference]
* Docs Updated: [YES/NO] — [List files, e.g., README.md, API.ts]
* Error Paths Validated: [PASS/FAIL]

**2. Policy & Regression Status:**
* Policy Mode Used: [Mode N] — Files Touched: [List]
* Linter/TS Check: [PASS/FAIL] — (Zero new warnings)
* Full Test Suite: [PASS/FAIL] — (Zero regressions)
* Deployment Build: [PASS/FAIL] — (Successful build)
* **Operational Readiness:** [PASS/FAIL] — (Config/Secrets flagged: [list names or N/A])

**3. Architectural & Clean-Up Status:**
* Clean Artifacts Left?: [NO/YES] — (Zero console.logs or temp files)
* Dependency Audit: [PASS/FAIL] — (No unnecessary installs)
* Architectural Adherence: [PASS/N/A]
* Simplicity Audit: [PASS/FLAGGED] — (No new complexity added, Major issues flagged)

**4. Next Step:**
* If PASS: The PR is ready for human review. Setting status to "Ready for Review".
* If FAIL: Creating follow-up commit to address: [list issues]
```

---

## 🎯 Branch Naming Template

```
ai/<ISSUE_NUMBER>-<kebab-case-description>-<YYYYMMDDHHmm>
```

**Examples:**
- `ai/123-fix-login-validation-202510151430`
- `ai/456-add-image-optimization-202510151445`
- `ai/789-refactor-auth-module-202510151500`

---

## 📋 Mode Declaration Template

**When to use:** In planning phase, declare which mode you're using and why.

```markdown
## 🎯 Mode Declaration

**Selected Mode:** Mode <N>
**Rationale:** <1-2 lines explaining why this mode is appropriate>
**Files to Modify:**
- <file1>
- <file2>
- <file3>

**Diff Estimate:** ~<X> lines, <Y> files (Budget: <mode-specific-budget>)
**Approval Status:** <Not Required | Requested | Approved>
```

---

## 🚨 Emergency Freeze Report Template (Mode 4)

**When to use:** When switching to Mode 4 due to high risk, uncertainty, or stalled work.

```markdown
🧊 EMERGENCY FREEZE (Mode 4)

Issue: #<NUM> — <TITLE>
Trigger: <What caused Mode 4 activation>

**Current Status:**
- Work completed: <% or description>
- Blocked by: <specific blocker>
- Risk level: <Low/Medium/High>

**What's Been Tried:**
1. <Attempt 1> — Result: <outcome>
2. <Attempt 2> — Result: <outcome>
3. <Attempt 3> — Result: <outcome>

**Information Needed:**
- <Question 1>
- <Question 2>
- <Decision needed: A vs B>

**Risk Assessment:**
- If we proceed with approach A: <risks>
- If we proceed with approach B: <risks>
- If we do nothing: <impact>

**Recommended Next Steps:**
1. <Recommendation 1>
2. <Recommendation 2>

**Requesting:** Immediate human direction to proceed.
```

---

## 🎓 Usage Tips

1. **Copy Exact Format:** Don't modify template structure unless necessary
2. **Fill All Sections:** Don't leave placeholders like `<TBD>` - complete everything
3. **Be Specific:** Replace `<description>` with actual detailed content
4. **Link Evidence:** Always include links to logs, builds, or documentation
5. **Keep Brief:** Respect line limits (e.g., "≤5 lines" means maximum 5)

---

## 🔄 Template Maintenance

When updating templates:
- Update version number and date in this file
- Notify all active agents
- Update related examples in [EXAMPLES.md](./EXAMPLES.md)
- Cross-reference with [WORKFLOW_GUIDE.md](./WORKFLOW_GUIDE.md)
