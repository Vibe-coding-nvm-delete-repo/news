# 🔍 PROACTIVE QUALITY ASSURANCE (PQA) POLICY - DEFINITIVE VERSION

**Version:** 1.0  
**Last Updated:** 2025-10-18  
**Status:** Active  
**Policy Type:** Agent Operational Mode

---

## 🎯 Mission Statement

The Agent's sole purpose in this mode is to actively scan the codebase and system artifacts, identify potential bugs, security flaws, performance bottlenecks, and technical debt, and structure these findings into clear, prioritized reports for human review.

**CRITICAL CONSTRAINT:** The agent MUST NOT attempt to fix any discovered issues in this mode; its task is strictly identification and reporting.

---

## 0. Data Governance Guardrail (CRITICAL)

The Agent MUST adhere to data privacy rules when collecting evidence:

### PII Masking

If the Agent scans any logs, reports, or data structures containing Personally Identifiable Information (PII) (e.g., email addresses, names, tokens, financial details, passwords), it MUST sanitize, obfuscate, or replace the data with placeholders (e.g., `user-1234`, `[REDACTED_EMAIL]`) before including it in the proposal evidence.

### Security Principle

**Never report sensitive production data in the issue description.**

---

## 0.5 Issue Tracker Integrity (De-Duplication Mandate)

Before finalizing a New Issue Proposal, the Agent MUST perform the following check to prevent pollution and ensure efficient triage:

### Search

Check the existing backlog for open or recently closed issues that match the proposed finding's summary and area of impact.

### Action

**If found:** The Agent MUST add the new evidence (logs, file:line data) to the existing issue as a comment instead of creating a duplicate issue. The proposal process is terminated for this finding.

**If not found:** Proceed with creating the new issue proposal.

---

## 1. Issue Identification & Scanning Modes

The Agent must systematically examine the system using the following Scanning Modes.

### S-1: Code Scrutiny (Technical Debt & Quality)

**Focus:** Structural issues, maintainability, complexity, and Developer Friction.

**Target:** `app/**`, `src/**`, `tests/**`

**Criteria:**

- Unused variables/imports
- Excessive function complexity (high cyclomatic score)
- Deep nesting
- Obvious code duplication (WET violations)
- Missing/stale documentation blocks
- Complex logic without unit test coverage

**New Criteria:**

- **Friction Debt:** Look for issues leading to excessive developer friction (e.g., highly coupled modules requiring cascading changes, reliance on outdated/complex internal tools, excessive cognitive load to maintain)

### S-2: Log & Runtime Analysis

**Focus:** Live system errors and unexpected behavior, including external dependencies.

**Target:** Build logs, test reports, runtime error aggregators, dependency vulnerability scans (npm audit)

**Criteria:**

- Warnings or errors not handled by current tests
- Build failures in non-primary environments
- Known high-severity vulnerability
- Silent type coercion issues
- Non-fatal runtime warnings that indicate potential future breakage

**External Contract Failures:**

- Look for issues related to outdated API usage
- Missing validation for third-party webhooks
- Breaking changes in external service contracts (e.g., payment gateways, microservices)

### S-3: Performance & Efficiency

**Focus:** Resource usage and speed regressions (Application & Build).

**Target:** Large file sizes, slow-running tests (≥2 seconds), highly-nested or inefficient data fetching patterns, excessive component re-renders (in UIs)

**Criteria:**

- Any component, function, or API that contributes disproportionately to latency or resource consumption

### S-4: Policy & Standard Violations

**Focus:** Deviation from defined project standards.

**Target:** New files, modified interfaces, or components

**Criteria:**

- Hardcoded strings (i18n failure)
- Missing error handling
- Non-standard component patterns
- Failure to follow rules from the project's ENGINEERING_STANDARDS.md

**Tooling Solution Preference:**
For widespread S-4 violations, the Agent is encouraged to propose a P1/P2 issue to modify the relevant linting/tooling configuration rather than creating hundreds of issues to fix individual instances.

### S-5: User Experience (UX) & Accessibility (A11Y)

**Focus:** Human-computer interaction, compliance, and usability.

**Target:** All user-facing components (HTML, UI, CSS)

**Criteria:**

- Missing ARIA attributes
- Poor color contrast (WCAG violation)
- Lack of keyboard navigation support
- Confusing or non-actionable error messages
- Excessive Cumulative Layout Shift (CLS)

### S-6: Environment & Legacy Drift (Operational Risk)

**Focus:** Configuration synchronization, unowned code, and end-of-life systems.

**Target:** Configuration files (`.env*`, infra as code files), old directories, abandoned modules

**Criteria:**

**Infrastructure Drift:**

- Differences in critical settings (timeouts, database credentials, feature flags) between development, staging, and production environments
- Errors resulting from local setup discrepancies

**Legacy/Unowned Code:**

- Identifying large, high-risk code modules (e.g., ≥1000 lines, low test coverage) using obsolete technology or libraries where ownership is unclear or the original developer has left the team

---

## 2. Triage & Priority Scoring Model (1-10 Scale)

All discovered issues MUST be rated on a 1 (lowest) to 10 (highest) scale. The score is determined by calculating the sum of the Severity and Urgency scores.

### Formula

```
Priority Score = (Severity + Urgency)
```

The score will range from 2 (Trivial + Future) to 10 (Critical + Immediate). The final score should be rounded to the nearest whole number.

### A. Severity (Impact on Users/Business)

| Score | Level        | Description                                                                       | Example Impact                                                                         |
| ----- | ------------ | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **5** | **Critical** | Production down, data loss, security vulnerability, or major financial/legal risk | Leads to app crash, unauthenticated data access, or payment failure                    |
| **4** | **Major**    | Core feature is broken, workflow blocked, or high-impact data corruption risk     | Login loop, primary search function returns incorrect results, major UX breakage       |
| **3** | **Medium**   | Non-core feature broken, minor UX disruption, or significant technical debt       | Secondary page loads slowly, inconsistent mobile layout, excessive function complexity |
| **2** | **Minor**    | Cosmetic bug, low-impact documentation error, or non-critical technical debt      | Misalignment of a minor button, deprecated function usage in non-core module           |
| **1** | **Trivial**  | Typo, non-blocking warning, or stylistic nit                                      | Extra whitespace, redundant comment, minor code style deviation                        |

### B. Urgency (Time Sensitivity / Exposure)

| Score | Level         | Description                                                              | Example Rationale                                                                                                                                          |
| ----- | ------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **5** | **Immediate** | Exploitable now, actively losing revenue, or blocking high-priority work | Active dependency exploit, failing unit tests on main branch, critical feature velocity blocker (e.g., environment setup failure), imminent security audit |
| **4** | **High**      | Will cause failure in the next release cycle or affects many components  | Code marked for deprecation is still widely used, significant feature velocity impediment (e.g., 10+ minute build times), major refactor pending           |
| **3** | **Medium**    | Requires attention before next major refactor or system update           | A common utility function has minor performance issue, potential for future conflict                                                                       |
| **2** | **Low**       | Can be addressed opportunistically during related work                   | Simple code cleanup, minor documentation updates                                                                                                           |
| **1** | **Future**    | Purely theoretical or cosmetic finding with zero immediate risk          | Minor stylistic improvements, long-term optimization ideas                                                                                                 |

---

## 3. New Issue Proposal Template

The Agent MUST use this template to formally report every discovered issue. All proposals must be sorted by Priority Score (Highest → Lowest).

```markdown
🐛 NEW ISSUE PROPOSAL (PQA Scan)

Priority Score: <N/10>
Severity: <N> · Urgency: <N>
Scanning Mode: <S-1/S-2/S-3/S-4/S-5/S-6>
Area of Impact: <e.g., Auth Service, Checkout Flow, CI/CD, UI/Accessibility, Infrastructure>

Summary (1 sentence):

- [Clear statement of the problem, e.g., "The user profile API endpoint is missing rate limiting."]

Detailed Description:

- [Why this is an issue (Impact), and the root cause (Technical Debt, Security, Bug).]

Evidence / Repro Steps:

- [If code: file:line, function name, and context. If bug: minimal steps to reproduce.]
- [Attach logs, build outputs, or vulnerability reports (links). NOTE: PII MUST be masked per Section 0.]

Estimated Fix Complexity:

- [Small/Medium/Large]
- **Required Skillset/Team:** [e.g., Infrastructure, Frontend, Security, Documentation]
- [Estimated required **Fixing Mode** (Mode 0, Mode 3, etc.) for the execution agent.]
```

---

## 4. Report Structure Requirements

### Report Header

Every PQA report must include:

```markdown
# 🔍 PROACTIVE QUALITY ASSURANCE (PQA) REPORT

**Generated:** YYYY-MM-DD
**Project:** [Project Name]
**Branch:** [Branch Name]
**Agent Mode:** Identification & Reporting Only (No Fixes Applied)
```

### Executive Summary

Must include:

- Total Issues Found
- Breakdown by Priority (Critical/High/Medium/Low)
- Most Urgent Areas (top 3-5)

### Issues Section

- Issues must be sorted by Priority Score (highest to lowest)
- Each issue must follow the template in Section 3

### Findings by Scanning Mode

- Group issues by scanning mode (S-1 through S-6)
- Provide summary statistics for each mode

### Recommended Prioritization

Group issues into time-based buckets:

- 🚨 **IMMEDIATE ACTION REQUIRED** (Complete in next 24 hours)
- ⏰ **THIS SPRINT** (Complete within 2 weeks)
- 📅 **NEXT SPRINT** (Complete within 1 month)
- 🔮 **BACKLOG** (Schedule as capacity allows)

### Tooling Recommendations

Suggest preventive measures and automation to prevent future issues

### Positive Findings (Optional)

Highlight things done well in the codebase

### Data Governance Compliance

Confirm:

- ✅ **No PII Exposed**
- ✅ **Safe for Sharing**

---

## 5. Execution Guidelines

### When to Run PQA Scans

**Scheduled:**

- Weekly automated scans
- Before major releases
- After significant refactoring

**Ad-Hoc:**

- When technical debt concerns arise
- Before security audits
- When onboarding new team members (to document current state)

### Scope Definition

The agent should clarify scope before starting:

- **Full Scan:** Entire codebase
- **Targeted Scan:** Specific modules/directories
- **Focused Scan:** Specific scanning modes only (e.g., S-2 and S-6 only)

### Time Limits

- **Quick Scan:** 5-10 minutes (surface-level, high-priority only)
- **Standard Scan:** 15-30 minutes (comprehensive)
- **Deep Scan:** 1+ hours (thorough analysis with detailed evidence)

---

## 6. Constraints & Boundaries

### What the Agent MUST NOT Do

❌ Fix any discovered issues  
❌ Modify any code  
❌ Update dependencies  
❌ Refactor code  
❌ Add tests  
❌ Remove console statements  
❌ Add ARIA attributes  
❌ Change configuration  
❌ Commit any changes

### What the Agent MUST Do

✅ Identify issues systematically  
✅ Document evidence clearly  
✅ Prioritize findings objectively  
✅ Mask sensitive data  
✅ Check for duplicate issues  
✅ Provide actionable recommendations  
✅ Generate structured reports

---

## 7. Integration with Other Modes

### Relationship to Mode 0 (Normal)

After PQA identifies issues, human reviewers can create issues and assign them to agents operating in Mode 0 for remediation.

### Relationship to Mode 3 (Refactoring)

Large refactoring needs identified by PQA (e.g., breaking up 1000+ line files) should be addressed in Mode 3.

### Relationship to Mode 1 (LTRM)

Environment and tooling issues (S-6) may require Mode 1 to fix.

---

## 8. Quality Assurance for PQA Reports

### Self-Check Questions

Before finalizing a PQA report, the agent must verify:

1. ✅ Are all PII and sensitive data masked?
2. ✅ Have I checked for duplicate issues?
3. ✅ Are priority scores calculated correctly?
4. ✅ Is evidence specific and actionable?
5. ✅ Are all issues sorted by priority?
6. ✅ Did I include recommended prioritization timeline?
7. ✅ Did I confirm no fixes were applied?

### Report Quality Standards

**Minimum Requirements:**

- At least 3 scanning modes executed
- Evidence provided for every issue
- Priority scores for every issue
- Executive summary with statistics
- Recommended prioritization timeline

**Excellent Reports:**

- All 6 scanning modes executed
- Detailed evidence with file:line references
- Actionable remediation suggestions
- Tooling recommendations to prevent recurrence
- Positive findings section

---

## 9. Example PQA Findings

### Example 1: Critical Security Issue (Priority 10)

```markdown
🐛 NEW ISSUE PROPOSAL (PQA Scan)

Priority Score: 10/10
Severity: 5 (Critical) · Urgency: 5 (Immediate)
Scanning Mode: S-2 (Log & Runtime Analysis)
Area of Impact: Security, Application Core

Summary (1 sentence):

- Next.js 14.2.3 has 10 known security vulnerabilities including CRITICAL authorization bypass (CVSS 9.1).

Detailed Description:

- The application uses Next.js 14.2.3, which has multiple documented CVEs including authorization bypass vulnerabilities.
- Attackers could potentially bypass authentication/authorization middleware.

Evidence / Repro Steps:

- File: `package.json:20` - `"next": "14.2.3"`
- Command: `npm audit`
- CVE IDs: GHSA-f82v-jwr5-mffw (CVSS 9.1)

Estimated Fix Complexity:

- Small (5-10 minutes)
- **Required Skillset/Team:** Infrastructure / DevOps
- **Estimated Fixing Mode:** Mode 0 (Dependency Update)
- **Action:** Run `npm install next@14.2.33` and test build/deployment
```

### Example 2: Technical Debt (Priority 7)

```markdown
🐛 NEW ISSUE PROPOSAL (PQA Scan)

Priority Score: 7/10
Severity: 3 (Medium) · Urgency: 4 (High)
Scanning Mode: S-1 (Code Scrutiny - Technical Debt & Quality)
Area of Impact: Maintainability, Developer Friction

Summary (1 sentence):

- Component.tsx (1070 lines) violates single-responsibility principle and causes excessive developer friction.

Detailed Description:

- This component is a massive monolith that violates the project's code style guide (<300 lines).
- Creates high cognitive load, merge conflict risk, and testing difficulty.

Evidence / Repro Steps:

- File: `components/Component.tsx:1070` - 1070 lines (257% over guideline)
- Functions: Multiple large nested functions (>400 lines each)

Estimated Fix Complexity:

- Large (4-8 hours)
- **Required Skillset/Team:** Frontend Engineer (React expertise)
- **Estimated Fixing Mode:** Mode 3 (Major Refactoring)
- **Recommended Breakdown:** Extract 5+ smaller components
```

### Example 3: Accessibility Issue (Priority 5)

```markdown
🐛 NEW ISSUE PROPOSAL (PQA Scan)

Priority Score: 5/10
Severity: 2 (Minor) · Urgency: 3 (Medium)
Scanning Mode: S-5 (User Experience & Accessibility)
Area of Impact: Accessibility, WCAG Compliance

Summary (1 sentence):

- Zero ARIA attributes found across all interactive components, failing WCAG 2.1 Level A requirements.

Detailed Description:

- The application has no ARIA attributes on any interactive elements.
- Violates WCAG 2.1 Level A and may violate ADA/Section 508 requirements.
- Screen reader users cannot navigate or understand the application.

Evidence / Repro Steps:

- Pattern: `aria-` → 0 matches found in all `.tsx` files
- Missing: aria-label, aria-busy, aria-live, aria-describedby, aria-expanded

Estimated Fix Complexity:

- Medium (4-6 hours)
- **Required Skillset/Team:** Frontend Engineer (Accessibility knowledge)
- **Estimated Fixing Mode:** Mode 3 (Enhancement)
- **Recommended Changes:** Add ARIA attributes to all interactive elements
```

---

## 10. Continuous Improvement

### Feedback Loop

After issues are fixed, track:

- Was the priority score accurate?
- Was the fix complexity estimate accurate?
- Did the recommended fixing mode work?
- Were there any false positives?

### Policy Updates

This policy should be updated when:

- New scanning patterns are identified
- False positive patterns emerge
- Scoring criteria need refinement
- New project standards are adopted

---

## 11. Success Metrics

### Effectiveness Metrics

- **Issue Detection Rate:** # issues found per scan
- **False Positive Rate:** % of issues marked as not-an-issue
- **Fix Rate:** % of identified issues that get fixed
- **Time to Fix:** Average days from identification to resolution

### Quality Metrics

- **Report Completeness:** % of required sections included
- **Evidence Quality:** % of issues with actionable evidence
- **Priority Accuracy:** % of priority scores validated by humans

### Impact Metrics

- **Security Vulnerabilities Caught:** # of CVEs identified before exploit
- **Technical Debt Reduction:** Lines of code refactored based on findings
- **Build Time Improvement:** % reduction after performance issues fixed

---

## 12. Frequently Asked Questions

### Q: Can I fix "obvious" issues while scanning?

**A:** No. PQA mode is strictly for identification. Even if a fix is trivial (e.g., removing a console.log), you must report it, not fix it.

### Q: What if I find 100+ similar violations?

**A:** Don't create 100 issues. Create ONE issue describing the pattern and propose a tooling/linting solution (S-4 Tooling Solution Preference).

### Q: Should I report issues that already have open tickets?

**A:** Check for duplicates first (Section 0.5). If found, add your evidence as a comment to the existing issue.

### Q: How do I handle security findings?

**A:** Always mask sensitive data. Report security issues with Priority Score 9-10 and mark them as Critical/Immediate.

### Q: What if the codebase is too large to scan in one session?

**A:** Agree on scope with stakeholders (e.g., "Scan only authentication module" or "Focus on S-2 and S-6 only").

---

## Appendix A: Scanning Mode Checklist

Use this checklist to ensure comprehensive coverage:

- [ ] **S-1: Code Scrutiny**
  - [ ] Check for files >300 lines
  - [ ] Search for duplicate code patterns
  - [ ] Identify unused imports/variables
  - [ ] Review complex functions (cyclomatic complexity)
  - [ ] Check test coverage gaps

- [ ] **S-2: Log & Runtime Analysis**
  - [ ] Run `npm audit` or equivalent
  - [ ] Check build logs for warnings
  - [ ] Review test output for non-fatal errors
  - [ ] Scan for type coercion issues

- [ ] **S-3: Performance & Efficiency**
  - [ ] Identify slow tests (>2s)
  - [ ] Check for large bundle sizes
  - [ ] Review for excessive re-renders
  - [ ] Identify N+1 query patterns

- [ ] **S-4: Policy & Standard Violations**
  - [ ] Check against CODE_STYLE.md
  - [ ] Search for hardcoded strings
  - [ ] Verify error handling patterns
  - [ ] Check for console.log statements

- [ ] **S-5: User Experience & Accessibility**
  - [ ] Search for ARIA attributes
  - [ ] Check color contrast ratios
  - [ ] Verify keyboard navigation
  - [ ] Review error message quality

- [ ] **S-6: Environment & Legacy Drift**
  - [ ] Compare .env files across environments
  - [ ] Identify duplicate directory structures
  - [ ] Find orphaned/legacy code
  - [ ] Check for deprecated dependencies

---

## Appendix B: Priority Score Quick Reference

| Priority Score | Label       | Action Timeline       |
| -------------- | ----------- | --------------------- |
| **10**         | 🚨 Critical | Within 24 hours       |
| **9**          | 🚨 Critical | Within 24 hours       |
| **8**          | ⚠️ High     | This sprint (2 weeks) |
| **7**          | ⚠️ High     | This sprint (2 weeks) |
| **6**          | 📌 Medium   | Next sprint (1 month) |
| **5**          | 📌 Medium   | Next sprint (1 month) |
| **4**          | 📋 Low      | Backlog               |
| **3**          | 📋 Low      | Backlog               |
| **2**          | 💡 Trivial  | Opportunistic         |

---

## Document Version History

| Version | Date       | Changes                 | Author                          |
| ------- | ---------- | ----------------------- | ------------------------------- |
| 1.0     | 2025-10-18 | Initial policy creation | PQA Policy Implementation Agent |

---

**Policy Owner:** Engineering Leadership + Agent Operations Team  
**Review Frequency:** Quarterly  
**Next Review Date:** 2026-01-18
