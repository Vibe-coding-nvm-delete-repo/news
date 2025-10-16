# 🎯 Quick Reference Card - Print & Keep Handy!

**Last Updated:** 2025-10-15 | **Version:** 1.0

---

## 🔢 THE 6 MODES (Decision in 10 Seconds)

|  Mode   | When?                    | Files?                                  | Approval?  |
| :-----: | ------------------------ | --------------------------------------- | ---------- |
|  **0**  | Normal bug/feature       | app/**, src/**, tests/**, docs/**       | ❌ No      |
| **0.5** | Small cleanup (no issue) | app/**, src/**, tests/\*\* (≤50L/2F)    | ❌ No      |
|  **1**  | Baseline tests broken    | + jest.config, tsconfig, pkg.json (dev) | ❌ No      |
|  **2**  | CI broken                | .github/\*\* ONLY                       | ❌ No      |
|  **3**  | Need restricted files    | Approved list only                      | ✅ **YES** |
|  **4**  | High risk / uncertain    | NO MODIFICATIONS                        | ✅ **YES** |

---

## ⚡ QUICK DECISION TREE

```
Issue assigned → Run baseline checks → All pass?
  ├─ YES → Files in app/src/tests/docs?
  │         ├─ YES → MODE 0 ✅ GO!
  │         └─ NO → Need restricted → MODE 3 Request
  └─ NO → What failed?
            ├─ Tests/TS → MODE 1 (LTRM)
            ├─ CI → MODE 2
            └─ Uncertain → MODE 4
```

---

## 📏 DIFF BUDGETS

| Mode |  Max Lines   |  Max Files   |
| :--: | :----------: | :----------: |
|  0   |     300      |      4       |
| 0.5  |      50      |      2       |
|  1   |     120      |      2       |
|  2   |   Minimal    |     1-2      |
|  3   | Per approval | Per approval |

**Over by >50%?** → Decompose into sub-issues

---

## ✅ ACCEPTANCE CRITERIA (Every PR)

```bash
npm run lint -- --max-warnings=0  # ✅ MUST PASS
npx tsc --noEmit                   # ✅ MUST PASS
npm test -- --runInBand            # ✅ MUST PASS
npm run build                      # ✅ MUST PASS
```

**Plus:**

- ✅ ≥1 test added/modified
- ✅ No console.log / debugger
- ✅ No hardcoded secrets
- ✅ No hardcoded user strings (use i18n)

---

## 🚨 MODE 3 OVERRIDE REQUEST (Copy/Paste)

```markdown
🚨 OVERRIDE REQUEST (Mode 3 — Scoped)

Issue: #<NUM> — <TITLE>
Base ref: <branch>

Why override needed (≤5 lines):

- <reason>

Options considered:

1. <Option A> — Pros/Cons, Est, Risk
2. <Option B> — Pros/Cons, Est, Risk
3. <Option C> — Impact

Proposed plan (Option X):

- Paths: <files>
- Diff: ~<X>L, <Y>F
- Dependency: <change or N/A>
- Security: <review or N/A>
- Versioning: <Caret/Tilde/Pinned>
- Tests: <file>
- Timebox: <X>h

Evidence: <links>

APPROVAL NEEDED: Reply "APPROVE OVERRIDE: Mode 3 (Option X)"
```

---

## 💬 COMMIT MESSAGE TEMPLATE

```
<type>: <short-name> (Fixes #<NUM>)

Mode: <N>
RCA: <3-5 lines explaining WHY bug occurred>
Minimal fix: <1-2 lines describing change>
Tests: <test-file-path>
```

**Types:** `fix:` `feat:` `refactor:`

---

## 📋 BRANCH NAMING

```
ai/<issue>-<kebab-description>-<YYYYMMDDHHmm>
```

**Example:** `ai/123-fix-login-bug-202510151430`

---

## 🏷️ PR TITLE

```
/ai <type>: <description> (Fixes #<issue>)
```

**Example:** `/ai fix: email validation bypass (Fixes #123)`

---

## 🔑 THE 6 GOLDEN RULES

1. **Default Deny** → All files read-only unless explicitly allowed
2. **Non-Merge** → Never merge your own PR
3. **Fix or Flag** → Minor: fix now, Major: new issue
4. **72hr Timeout** → Mode 3 no response → Mode 4
5. **Verify Always** → Every PR passes full checklist
6. **Exception OK** → May modify denied files if DEFINITIVELY necessary

---

## 🚦 WHEN TO ESCALATE

**Mode 4 (Freeze) Triggers:**

- 🔒 Security issue found
- ❓ Architectural decision needed
- 🤔 Unclear requirements
- ⏰ Mode 3 timeout (72hrs)
- 🛑 High risk, unknown impact

**Action:** STOP work, document state, request human direction

---

## 🔍 FILE ACCESS CHEAT SHEET

| Path           | Mode 0 | Mode 1 | Mode 2 |  Mode 3  |
| -------------- | :----: | :----: | :----: | :------: |
| app/\*\*       |   ✅   |   ✅   |   ❌   | Approved |
| src/\*\*       |   ✅   |   ✅   |   ❌   | Approved |
| tests/\*\*     |   ✅   |   ✅   |   ❌   | Approved |
| docs/\*\*      |   ✅   |   ✅   |   ❌   | Approved |
| jest.config.\* |   ❌   |   ✅   |   ❌   | Approved |
| tsconfig.json  |   ❌   |   ✅   |   ❌   | Approved |
| package.json   |   ❌   |  ✅\*  |   ❌   | Approved |
| .github/\*\*   |   ❌   |   ❌   |   ✅   | Approved |
| Root configs   |   ❌   |   ❌   |   ❌   | Approved |
| Images/assets  |   ❌   |   ❌   |   ❌   | Approved |

\*Mode 1: devDependencies only, ONE addition

---

## 🎯 VERIFICATION QUICK CHECKLIST

**Phase 1: Core Fix**

- [ ] Original issue resolved (with evidence)
- [ ] Test added/modified
- [ ] Docs updated (if applicable)

**Phase 2: Policy**

- [ ] Files within mode allowlist
- [ ] Diff within budget
- [ ] All quality checks pass

**Phase 3: Clean-Up**

- [ ] No console.log / debugger
- [ ] No commented code
- [ ] No unused deps

**Phase 4: PR Hygiene**

- [ ] Branch name correct
- [ ] Commit message complete
- [ ] PR title has /ai prefix
- [ ] NOT merged (human review required)

---

## 📞 EMERGENCY CONTACTS

**Questions?** → [Troubleshooting Guide](./TROUBLESHOOTING.md)  
**Examples?** → [Examples & Case Studies](./EXAMPLES.md)  
**Slack:** #agent-operations  
**Email:** agent-support@company.com

**Security Issue?** → MODE 4 immediately, flag security team

---

## 📚 FULL DOCS

🏠 **Start Here:** [Quick Start Guide](./QUICK_START.md)  
📖 **Complete Ref:** [Mode Reference](./MODE_REFERENCE.md)  
🔄 **Workflows:** [Workflow Guide](./WORKFLOW_GUIDE.md)  
✅ **Verification:** [Verification Checklist](./VERIFICATION_CHECKLIST.md)  
🎯 **All Docs:** [Documentation Hub](./README.md)

---

## 💡 PRODUCTIVITY TIPS

**Before Starting:**

1. Run baseline checks first
2. Declare mode early
3. List exact files to modify

**During Work:** 4. Stay within diff budget 5. Look for improvement opportunities 6. Add test immediately

**Before PR:** 7. Run all quality checks 8. Verify file allowlist compliance 9. Complete verification checklist

**After PR:** 10. Request review promptly 11. Never merge yourself 12. Track metrics for continuous improvement

---

**🚀 Ready? Start with Mode 0, escalate only when necessary!**

---

_Print this card and keep it handy for quick reference during autonomous agent operations._
