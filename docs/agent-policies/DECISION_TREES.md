# 🌳 Decision Trees - Visual Flowcharts

**Purpose:** Visual decision-making aids for mode selection, escalation, and common scenarios.

---

## 📑 Tree Index

- [Master Mode Selection Tree](#master-mode-selection-tree)
- [File Modification Decision Tree](#file-modification-decision-tree)
- [Override Request Decision Tree](#override-request-decision-tree)
- [Verification Failure Decision Tree](#verification-failure-decision-tree)
- [Merge Conflict Resolution Tree](#merge-conflict-resolution-tree)
- [Dependency Addition Decision Tree](#dependency-addition-decision-tree)

---

## 🎯 Master Mode Selection Tree

```
┌─────────────────────────────────────────────┐
│ START: Assigned Issue #XXX                 │
│ Goal: Select correct execution mode        │
└──────────────┬──────────────────────────────┘
               │
               ▼
       ┌───────────────────┐
       │ Run Baseline      │
       │ Checks:           │
       │ • npm ci          │
       │ • npx tsc         │
       │ • npm test        │
       │ • npm run build   │
       └─────┬─────────────┘
             │
        ┌────┴────┐
        │ Result? │
        └────┬────┘
             │
      ┌──────┴──────┐
      │             │
   ✅ PASS       ❌ FAIL
      │             │
      │             ▼
      │     ┌──────────────────┐
      │     │ What failed?     │
      │     └──────┬───────────┘
      │            │
      │      ┌─────┴─────┐
      │      │           │
      │   Tests/TS     Build/CI
      │      │           │
      │      ▼           ▼
      │  ┌─────────┐  ┌─────────┐
      │  │Is it    │  │Is it    │
      │  │tooling? │  │.github? │
      │  └────┬────┘  └────┬────┘
      │       │            │
      │    YES│ NO      YES│ NO
      │       │  │         │  │
      │       ▼  │         ▼  │
      │    MODE 1 │     MODE 2 │
      │    LTRM   │   CI_REPAIR│
      │           │            │
      │           └────┬───────┘
      │                │
      │                ▼
      │         MODE 4 (Unclear)
      │
      ▼
┌─────────────────────────┐
│ Baseline PASSED         │
│ Analyze File Needs      │
└──────┬──────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ List ALL files to modify     │
└──────┬───────────────────────┘
       │
       ▼
┌────────────────────────────────────┐
│ Are ALL files in Mode 0 allowlist? │
│ • app/**                           │
│ • src/**                           │
│ • tests/**                         │
│ • docs/**                          │
└──────┬─────────────────────────────┘
       │
   ┌───┴───┐
   │       │
  YES     NO
   │       │
   │       ▼
   │   ┌──────────────────────┐
   │   │ Need restricted      │
   │   │ files?               │
   │   └──────┬───────────────┘
   │          │
   │          ▼
   │   ┌────────────────────────────┐
   │   │ Examples of restricted:    │
   │   │ • package.json (runtime)   │
   │   │ • Root configs             │
   │   │ • .github/** (non-repair)  │
   │   │ • Non-text assets          │
   │   └──────┬─────────────────────┘
   │          │
   │          ▼
   │      MODE 3
   │   (Submit Override
   │      Request)
   │
   ▼
┌──────────────────────┐
│ All files allowed    │
│ Check issue status   │
└──────┬───────────────┘
       │
   ┌───┴───┐
   │       │
Issue    No Issue
Exists    Exists
   │       │
   │       ▼
   │   ┌──────────────────┐
   │   │ Is it refactor?  │
   │   │ • ≤50 lines?     │
   │   │ • ≤2 files?      │
   │   │ • No logic change?│
   │   └──────┬───────────┘
   │          │
   │      ┌───┴───┐
   │      │       │
   │     YES     NO
   │      │       │
   │      ▼       │
   │   MODE 0.5   │
   │  (Refactor)  │
   │              │
   │   ┌──────────┘
   │   │
   │   ▼
   │ Create
   │ Issue
   │ First
   │
   ▼
MODE 0
(Normal)

┌─────────────────────────────────┐
│ SPECIAL CASES:                  │
│ • Uncertain? → MODE 4           │
│ • High risk? → MODE 4           │
│ • Security issue? → MODE 4      │
│ • Ambiguous requirements? → 4   │
└─────────────────────────────────┘
```

---

## 📁 File Modification Decision Tree

```
┌──────────────────────────────────┐
│ Need to modify: <FILE_PATH>      │
└──────────┬───────────────────────┘
           │
           ▼
    ┌──────────────┐
    │ Check path   │
    └──────┬───────┘
           │
           ▼
    Is file in:
    • app/**
    • src/**
    • tests/**
    • docs/**
           │
       ┌───┴───┐
       │       │
      YES     NO
       │       │
       │       ▼
       │   ┌─────────────────────┐
       │   │ Is it:              │
       │   │ • jest.config.*     │
       │   │ • tsconfig*.json    │
       │   │ • tests/setup*.ts   │
       │   │ • package.json      │
       │   │   (devDeps only)?   │
       │   └──────┬──────────────┘
       │          │
       │      ┌───┴───┐
       │      │       │
       │     YES     NO
       │      │       │
       │      ▼       │
       │  ┌─────────┐ │
       │  │Baseline │ │
       │  │broken?  │ │
       │  └────┬────┘ │
       │       │      │
       │   ┌───┴───┐  │
       │  YES     NO  │
       │   │       │  │
       │   ▼       │  │
       │ MODE 1    │  │
       │           │  │
       │   ┌───────┘  │
       │   │          │
       │   ▼          ▼
       │ Need      Is it:
       │ MODE 3    • .github/**?
       │              │
       │          ┌───┴───┐
       │         YES     NO
       │          │       │
       │          ▼       │
       │      ┌─────────┐ │
       │      │Baseline │ │
       │      │CI       │ │
       │      │broken?  │ │
       │      └────┬────┘ │
       │           │      │
       │       ┌───┴───┐  │
       │      YES     NO  │
       │       │       │  │
       │       ▼       │  │
       │    MODE 2    │  │
       │              │  │
       │   ┌──────────┘  │
       │   │             │
       │   └─────────────┘
       │                 │
       │                 ▼
       │           Need MODE 3
       │          (Root configs,
       │           runtime deps,
       │           assets, etc.)
       │
       ▼
   ✅ Allowed
   Proceed with
   current mode

┌─────────────────────────────────┐
│ REMEMBER:                       │
│ • Reading ANY file: ✅ Allowed  │
│ • Writing: Check allowlist      │
└─────────────────────────────────┘
```

---

## 🚨 Override Request Decision Tree

```
┌─────────────────────────────────┐
│ Need to modify restricted files │
└──────────┬──────────────────────┘
           │
           ▼
    ┌──────────────┐
    │ Can I avoid  │
    │ it with      │
    │ different    │
    │ approach?    │
    └──────┬───────┘
           │
       ┌───┴───┐
       │       │
      YES     NO
       │       │
       │       ▼
       │   ┌──────────────────┐
       │   │ Is risk high     │
       │   │ or uncertain?    │
       │   └──────┬───────────┘
       │          │
       │      ┌───┴───┐
       │      │       │
       │     YES     NO
       │      │       │
       │      ▼       │
       │   MODE 4     │
       │  (Freeze)    │
       │              │
       │              ▼
       │        ┌──────────────┐
       │        │ Prepare      │
       │        │ Override     │
       │        │ Request:     │
       │        │              │
       │        │ 1. Evidence  │
       │        │ 2. Options   │
       │        │    (≥3)      │
       │        │ 3. Security  │
       │        │    review    │
       │        │ 4. Estimate  │
       │        └──────┬───────┘
       │               │
       │               ▼
       │         Submit Request
       │               │
       │               ▼
       │        ┌──────────────┐
       │        │ Wait for     │
       │        │ response     │
       │        └──────┬───────┘
       │               │
       │           ┌───┴───────────┐
       │           │               │
       │        <24hrs          24-48hrs
       │           │               │
       │           │               ▼
       │           │         Send reminder
       │           │               │
       │           ├───────────────┘
       │           │
       │           ▼
       │      Response received?
       │           │
       │      ┌────┴────┐
       │      │         │
       │     YES       NO (72hrs)
       │      │         │
       │      │         ▼
       │      │    AUTO: MODE 4
       │      │    (Stale request)
       │      │
       │      ▼
       │  ┌─────────────────┐
       │  │ Approved?       │
       │  └────┬────────────┘
       │       │
       │   ┌───┴───┐
       │  YES     NO
       │   │       │
       │   ▼       ▼
       │ MODE 3  Return to
       │ (Go!)   Mode 0
       │         (Alt plan)
       │
       ▼
   Use Mode 0
   alternative

┌──────────────────────────────────┐
│ KEY DECISION POINTS:             │
│ • Always explore alternatives    │
│ • Never proceed without approval │
│ • 72hr timeout → auto-freeze     │
└──────────────────────────────────┘
```

---

## ✅ Verification Failure Decision Tree

```
┌─────────────────────────────────┐
│ Verification check FAILED       │
└──────────┬──────────────────────┘
           │
           ▼
    ┌─────────────────┐
    │ Which check     │
    │ failed?         │
    └──────┬──────────┘
           │
    ┌──────┴──────────────────┐
    │                         │
    │                         │
Linter/TS              Other checks
(Auto-fix              (Policy,
required)              Tests, etc.)
    │                         │
    ▼                         ▼
┌──────────────┐      ┌──────────────────┐
│ MUST fix     │      │ Classify issue:  │
│ immediately  │      └──────┬───────────┘
└──────┬───────┘             │
       │               ┌─────┴─────┐
       │               │           │
       │            Minor       Major
       │          (Quick fix) (Systemic)
       │               │           │
       │               │           │
       │               ▼           ▼
       │         ┌──────────┐  ┌─────────────┐
       │         │Examples: │  │Examples:    │
       │         │• Logic   │  │• Arch flaw  │
       │         │  error   │  │• DB schema  │
       │         │• Missing │  │• Legacy     │
       │         │  test    │  │  module     │
       │         │• Cleanup │  └──────┬──────┘
       │         └────┬─────┘         │
       │              │               │
       │              ▼               ▼
       │         FIX NOW        CREATE PQA
       │              │          ISSUE
       │              │               │
       └──────────────┼───────────────┘
                      │
                      ▼
              ┌──────────────┐
              │ Create new   │
              │ commit with  │
              │ fix          │
              └──────┬───────┘
                     │
                     ▼
              ┌──────────────┐
              │ RESTART      │
              │ entire       │
              │ verification │
              │ process      │
              └──────────────┘

┌──────────────────────────────────┐
│ FIX OR FLAG RULE:                │
│ • Minor → Fix immediately        │
│ • Major → Flag with new issue    │
│ • Both → Restart verification    │
└──────────────────────────────────┘
```

---

## 🔀 Merge Conflict Resolution Tree

```
┌─────────────────────────────────┐
│ Merge conflict detected         │
└──────────┬──────────────────────┘
           │
           ▼
    ┌─────────────────┐
    │ What file(s)?   │
    └──────┬──────────┘
           │
    ┌──────┴────────────────┐
    │                       │
Application code      Lockfile
(src/, app/,         (package-lock.json,
 tests/)              pnpm-lock.yaml)
    │                       │
    ▼                       ▼
┌──────────────┐    ┌──────────────────┐
│ Can you      │    │ EASY FIX:        │
│ determine    │    │ 1. git checkout  │
│ correct      │    │    --theirs      │
│ resolution?  │    │    <lockfile>    │
└──────┬───────┘    │ 2. npm install   │
       │            │ 3. git add       │
   ┌───┴───┐        │ 4. Continue      │
   │       │        └──────────────────┘
  YES     NO
   │       │
   │       ▼
   │   ┌──────────────┐
   │   │ Is conflict  │
   │   │ complex?     │
   │   │ • Multiple   │
   │   │   files      │
   │   │ • Logic      │
   │   │   conflicts  │
   │   │ • Unclear    │
   │   │   intent     │
   │   └──────┬───────┘
   │          │
   │      ┌───┴───┐
   │      │       │
   │     YES     NO
   │      │       │
   │      ▼       │
   │   MODE 4     │
   │  (Freeze &   │
   │   Request    │
   │   Human      │
   │   Help)      │
   │              │
   │              ▼
   │         Try manual
   │         resolution
   │              │
   │              ▼
   │         Document
   │         decision
   │
   ▼
┌──────────────────┐
│ Resolve conflict │
│ manually:        │
│ 1. Edit files    │
│ 2. Remove        │
│    markers       │
│    (<<<<, ====,  │
│     >>>>)        │
│ 3. Test choice   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Mark resolved:   │
│ git add <file>   │
│ git rebase       │
│ --continue       │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ RE-RUN all       │
│ acceptance       │
│ criteria:        │
│ • Lint           │
│ • TypeScript     │
│ • Tests          │
│ • Build          │
└──────┬───────────┘
       │
   ┌───┴───┐
   │       │
  PASS   FAIL
   │       │
   │       ▼
   │   Fix issues
   │       │
   │       └───┐
   │           │
   ▼           ▼
Continue   Fix & retry
with PR

┌──────────────────────────────────┐
│ GOLDEN RULE:                     │
│ When in doubt, freeze and ask    │
│ (Mode 4)                         │
└──────────────────────────────────┘
```

---

## 📦 Dependency Addition Decision Tree

```
┌─────────────────────────────────┐
│ Need to add dependency          │
└──────────┬──────────────────────┘
           │
           ▼
    ┌─────────────────┐
    │ What type?      │
    └──────┬──────────┘
           │
    ┌──────┴──────────────┐
    │                     │
devDependency        dependency
(dev only)           (runtime)
    │                     │
    │                     ▼
    │              ┌─────────────┐
    │              │ NOT allowed │
    │              │ in Mode 0   │
    │              │             │
    │              │ → Need      │
    │              │   MODE 3    │
    │              └─────────────┘
    │
    ▼
┌──────────────────┐
│ Is baseline      │
│ tooling broken?  │
└──────┬───────────┘
       │
   ┌───┴───┐
   │       │
  YES     NO
   │       │
   │       ▼
   │   ┌──────────────┐
   │   │ NOT allowed  │
   │   │ in Mode 0    │
   │   │              │
   │   │ → Need       │
   │   │   MODE 3     │
   │   └──────────────┘
   │
   ▼
┌──────────────────┐
│ Can use MODE 1   │
│ (LTRM)           │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ How many         │
│ devDeps to add?  │
└──────┬───────────┘
       │
   ┌───┴───┐
   │       │
  ONE   MULTIPLE
   │       │
   │       ▼
   │   ┌──────────────┐
   │   │ Only ONE     │
   │   │ allowed in   │
   │   │ Mode 1       │
   │   │              │
   │   │ Choose most  │
   │   │ critical OR  │
   │   │ → MODE 3     │
   │   └──────────────┘
   │
   ▼
✅ Allowed
in MODE 1

Follow LTRM
workflow

┌──────────────────────────────────┐
│ SECURITY CHECKS (ALL MODES):     │
│ 1. npm audit --package=<name>    │
│ 2. Check license (MIT, Apache OK)│
│ 3. Check maintenance (recent)    │
│ 4. Check downloads (popularity)  │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ VERSIONING (Mode 3):             │
│ • Caret (^): Minor/patch updates │
│ • Tilde (~): Patch updates only  │
│ • Pinned: No auto-updates        │
│                                  │
│ State preference in request!     │
└──────────────────────────────────┘
```

---

## 🎯 Task Decomposition Decision Tree

```
┌─────────────────────────────────┐
│ Estimated change:                │
│ <X> lines, <Y> files             │
└──────────┬──────────────────────┘
           │
           ▼
    ┌─────────────────┐
    │ Compare to      │
    │ Mode budget:    │
    │ • Mode 0: 300L/4F│
    │ • Mode 0.5: 50L/2F│
    │ • Mode 1: 120L/2F│
    └──────┬──────────┘
           │
           ▼
    Within budget?
           │
       ┌───┴───┐
       │       │
      YES     NO
       │       │
       │       ▼
       │   ┌──────────────────┐
       │   │ Over by >50%?    │
       │   │ (e.g., 450L for  │
       │   │  Mode 0)         │
       │   └──────┬───────────┘
       │          │
       │      ┌───┴───┐
       │      │       │
       │     YES     NO
       │      │       │
       │      │       ▼
       │      │   ┌──────────┐
       │      │   │ Minor    │
       │      │   │ overrun: │
       │      │   │ OK or    │
       │      │   │ Request  │
       │      │   │ Mode 3   │
       │      │   └──────────┘
       │      │
       │      ▼
       │  ┌──────────────────┐
       │  │ MUST decompose   │
       │  └──────┬───────────┘
       │         │
       │         ▼
       │    ┌──────────────────┐
       │    │ Can work be      │
       │    │ split into       │
       │    │ independent      │
       │    │ sub-tasks?       │
       │    └──────┬───────────┘
       │           │
       │       ┌───┴───┐
       │       │       │
       │      YES     NO
       │       │       │
       │       │       ▼
       │       │   ┌──────────┐
       │       │   │ Tightly  │
       │       │   │ coupled: │
       │       │   │          │
       │       │   │ Request  │
       │       │   │ Mode 3   │
       │       │   │ Override │
       │       │   └──────────┘
       │       │
       │       ▼
       │   ┌──────────────────┐
       │   │ Break into       │
       │   │ sub-issues:      │
       │   │                  │
       │   │ #100a: (150L/2F) │
       │   │ #100b: (200L/3F) │
       │   │ #100c: (100L/2F) │
       │   └──────┬───────────┘
       │          │
       │          ▼
       │      Each within
       │      budget ✅
       │
       ▼
   Proceed with
   single issue

┌──────────────────────────────────┐
│ DECOMPOSITION CRITERIA:          │
│ • Each sub-task independently    │
│   testable                       │
│ • Clear dependencies between     │
│   tasks                          │
│ • Each task delivers value       │
└──────────────────────────────────┘
```

---

## 📚 Quick Reference - Mode Decision

**Use this for rapid decisions:**

```
Am I modifying ONLY app/**, src/**, tests/**, docs/**?
  ├─ YES → Is there an issue? → YES → MODE 0
  │                          └─ NO → Is it ≤50L/2F refactor? → YES → MODE 0.5
  │                                                           └─ NO → Create issue
  └─ NO → Is baseline broken?
           ├─ YES → Is it local tooling? → YES → MODE 1
           │                             └─ NO → Is it CI? → YES → MODE 2
           │                                               └─ NO → MODE 4
           └─ NO → Need restricted files → MODE 3

Am I uncertain or is risk high? → Always MODE 4 (when in doubt)
```

---

## 🔗 Related Documentation

- [Mode Reference](./MODE_REFERENCE.md) - Detailed mode rules
- [Quick Start](./QUICK_START.md) - Basic workflows
- [Workflow Guide](./WORKFLOW_GUIDE.md) - Step-by-step processes
- [Troubleshooting](./TROUBLESHOOTING.md) - Problem solutions
