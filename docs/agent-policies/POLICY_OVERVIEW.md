# 📘 Policy Overview - High-Level Governance Summary

**Audience:** Engineering Leadership, Project Managers, Stakeholders  
**Purpose:** Executive summary of the autonomous agent governance system

---

## 🎯 Executive Summary

This autonomous agent policy establishes a **strict governance framework** for AI-powered code changes, ensuring:

✅ **Safety** - Restricted file access prevents accidental infrastructure damage  
✅ **Auditability** - Every decision is traceable with clear mode declarations  
✅ **Velocity** - 80%+ of changes proceed without approval (Modes 0, 0.5, 1, 2)  
✅ **Quality** - Mandatory verification checklist before human review  
✅ **Scalability** - Clear escalation paths for complex scenarios

---

## 🏗️ System Architecture

### Three-Layer Governance Model

```
┌────────────────────────────────────────────┐
│  Layer 1: Execution Modes (What can run)  │
│  ─────────────────────────────────────────  │
│  6 modes (0, 0.5, 1, 2, 3, 4)              │
│  Control file access & approval gates      │
└────────────────────────────────────────────┘
              ↓
┌────────────────────────────────────────────┐
│  Layer 2: Workflows (How to execute)       │
│  ─────────────────────────────────────────  │
│  6-step process per issue                  │
│  Reproduce → Plan → Implement → Verify     │
└────────────────────────────────────────────┘
              ↓
┌────────────────────────────────────────────┐
│  Layer 3: Verification (Quality gates)     │
│  ─────────────────────────────────────────  │
│  Mandatory final audit before handoff      │
│  Fix or Flag rule for failures             │
└────────────────────────────────────────────┘
```

---

## 🔢 The 6 Execution Modes

### Approval-Free Modes (80% of work)

| Mode | Name | Use Case | Approval | Typical Use |
|------|------|----------|----------|-------------|
| **0** | Normal | Standard bugs/features | ❌ No | 70% of work |
| **0.5** | Refactor | Small cleanup (≤50L/2F) | ❌ No | 5% of work |
| **1** | LTRM | Local tooling repair | ❌ No | 3% of work |
| **2** | CI_REPAIR | CI workflows broken | ❌ No | 2% of work |

**Total: 80% of work proceeds immediately without human approval**

### Approval-Required Modes (20% of work)

| Mode | Name | Use Case | Approval | Typical Use |
|------|------|----------|----------|-------------|
| **3** | Scoped Override | Runtime deps, root configs | ✅ **YES** | 15% of work |
| **4** | Emergency Freeze | High risk, stalled work | ✅ **YES** | 5% of work |

---

## 📊 Key Metrics & Performance

### Process Health Indicators

```
┌─────────────────────────────────────┐
│ Velocity Metrics                    │
├─────────────────────────────────────┤
│ • Mode 0 PR Turnaround: <4 hours    │
│ • Mode 3 Approval Time: <24 hours   │
│ • Verification Pass Rate: >95%      │
│ • Rework Rate: <5%                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Quality Metrics                     │
├─────────────────────────────────────┤
│ • Test Coverage: Maintained/increased│
│ • Linter Warnings: 0 (enforced)     │
│ • Production Incidents: Track trend │
│ • Rollback Rate: <2%                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Governance Metrics                  │
├─────────────────────────────────────┤
│ • Policy Violations: 0 (enforced)   │
│ • Mode 3 Approval Rate: ~90%        │
│ • Mode 4 Escalations: <5% of issues │
│ • Stale Work (>10 days): <3%        │
└─────────────────────────────────────┘
```

---

## 🛡️ Safety Mechanisms

### 1. File Access Control (Allowlist/Denylist)

**Default Deny:** All files are read-only unless explicitly allowed by current mode.

**Mode 0 Allowlist (80% of changes):**
- ✅ `app/**` - Application code
- ✅ `src/**` - Source code
- ✅ `tests/**` - Test files
- ✅ `docs/**` - Documentation

**Denylist (Requires Mode 3 approval):**
- 🚫 Root configs (`eslint.config.*`, `tsconfig.json`)
- 🚫 Dependencies (`package.json`, lockfiles)
- 🚫 CI/CD (`.github/**`)
- 🚫 Infrastructure (`Dockerfile`, `vercel.*`)

**Exception:** Agent may modify denied files if it conclusively believes they're necessary to fix a core issue (with documentation).

### 2. Diff Budget Constraints

**Prevents scope creep and ensures reviewability:**

| Mode | Max Lines | Max Files | Rationale |
|------|-----------|-----------|-----------|
| 0 | 300 | 4 | Reviewable in <15 min |
| 0.5 | 50 | 2 | Trivial refactor |
| 1 | 120 | 2 | Focused tooling fix |
| 2 | Minimal | 1-2 | Surgical CI repair |
| 3 | Per approval | Per approval | Explicitly scoped |

### 3. Mandatory Quality Gates

**Every PR must pass:**
```bash
✅ npm run lint -- --max-warnings=0   (Zero warnings enforced)
✅ npx tsc --noEmit                    (Zero type errors)
✅ npm test -- --runInBand             (All tests pass)
✅ npm run build                       (Production build succeeds)
```

**Additional Checks:**
- ✅ Performance: No significant regressions
- ✅ Security: No hardcoded secrets
- ✅ i18n: No hardcoded user-facing strings

### 4. Non-Merge Rule

**Critical Safety Net:**
- Agents **NEVER** merge their own PRs
- All PRs require explicit human review and approval
- Prevents runaway automation

---

## 🚀 Velocity Features

### 1. Self-Service for Routine Work

**80% of issues auto-proceed** through Modes 0, 0.5, 1, 2 without approval:
- Bug fixes in application code
- New features (within scope)
- Small refactors
- Local tooling repairs
- CI workflow fixes

### 2. Structured Escalation (Mode 3)

When approval is needed, agents provide:
- **Evidence pack** (logs, builds, failures)
- **Options analysis** (minimum 3 alternatives)
- **Security review** (CVEs, licenses, maintenance)
- **Impact estimation** (lines, files, risk level)

**Result:** Human reviewers make informed decisions in <30 minutes

### 3. Proactive Issue Detection

**Continuous Improvement Mandate:**
- Agents actively identify technical debt during work
- Document findings as "New Issue Proposals" in PR
- Human team prioritizes improvements

**Prevents:** Debt accumulation, reduces future friction

### 4. Fast Feedback Loops

**Verification happens before human review:**
- Agent self-audits all acceptance criteria
- "Fix or Flag" rule: Fix minor issues immediately
- Major issues → Create PQA (Process/Quality/Architecture) issue

**Result:** Reviewers see only high-quality, ready-to-merge PRs

---

## 🎓 Training & Onboarding

### For Developers (Time to Productivity: 1 hour)

1. **Read:** [Quick Start Guide](./QUICK_START.md) (5 min)
2. **Memorize:** 6 modes and allowlist (10 min)
3. **Practice:** Shadow 2-3 agent PRs (30 min)
4. **Reference:** Bookmark [Templates](./TEMPLATES.md) and [Decision Trees](./DECISION_TREES.md) (5 min)

### For Reviewers (Time to Productivity: 30 min)

1. **Read:** [Verification Checklist](./VERIFICATION_CHECKLIST.md) (10 min)
2. **Understand:** [Acceptance Criteria](./ACCEPTANCE_CRITERIA.md) (10 min)
3. **Practice:** Review 1-2 completed agent PRs (10 min)

### For Project Managers (Time to Productivity: 15 min)

1. **Read:** This Policy Overview (5 min)
2. **Understand:** [Metrics & KPIs](./METRICS.md) (5 min)
3. **Review:** [Integration Guide](./INTEGRATION_GUIDE.md) for tool setup (5 min)

---

## 🔄 Continuous Improvement Process

### 1. Stale Work Detection

**Auto-Escalation Rules:**
- Mode 3 request timeout → 72 hours → Auto-freeze (Mode 4)
- Stale PR → 10 days without interaction → Auto-freeze (Mode 4)

**Prevents:** Work getting lost, agents spinning indefinitely

### 2. Technical Debt Identification

**During every issue, agents check for:**
- Dead code opportunities
- Testing gaps (coverage, speed, clarity)
- Performance optimization potential
- Development flow improvements

**If improvement is outside scope:**
- Document as "New Issue Proposal" in PR
- Include: Scope, justification, complexity, priority
- Human team triages and creates issues

### 3. Process Feedback

**Quarterly Reviews:**
- Analyze metrics (velocity, quality, governance)
- Identify policy gaps or friction points
- Update documentation
- Share learnings with team

---

## 📋 Compliance & Audit Trail

### Every Change is Traceable

**PR Artifacts:**
- Branch naming: `ai/<issue>-<description>-<timestamp>`
- Commit message: Includes Mode, RCA (3-5 lines), tests
- PR body: Mode justification, conformance checklist
- Verification report: Complete audit results

**Example Audit Query:**
```bash
# Find all Mode 3 changes in last 30 days
gh pr list --search "Mode 3" --json number,title,createdAt,mergedAt

# Find all agent PRs that touched package.json
gh pr list --search "author:agent path:package.json" --json number,title
```

### Regulatory Compliance

**Built-in Controls:**
- Security: No hardcoded secrets (enforced via verification)
- Data Privacy: PII detection in logs (manual check + proposed automation)
- Licensing: Dependency license review required for Mode 3
- SOC2/ISO27001: Audit trail + approval workflow + non-merge rule

---

## 🎯 Success Criteria for Scaled Adoption

### Phase 1: Pilot (Month 1-2)
- ✅ 10 issues completed via agent
- ✅ All reviewers trained
- ✅ Zero policy violations
- ✅ Metrics baseline established

### Phase 2: Expansion (Month 3-6)
- ✅ 50+ issues/month via agent
- ✅ Mode 3 approval time <24 hours (avg)
- ✅ Verification pass rate >90%
- ✅ Team satisfaction survey >4/5

### Phase 3: Maturity (Month 7+)
- ✅ 80%+ of routine issues via agent
- ✅ Mode 3 approval time <12 hours (avg)
- ✅ Verification pass rate >95%
- ✅ Measurable reduction in P2/P3 backlog

---

## 🆘 Escalation & Support

### When to Escalate

**To Engineering Lead:**
- Mode 3 request pending >48 hours
- Mode 4 freeze requiring architectural decision
- Policy violation detected

**To Security Team:**
- Vulnerability discovered during implementation
- Dependency security concern (CVE, suspicious package)
- Data exposure risk identified

**To Product/PM:**
- Requirements ambiguity blocking progress
- Feature scope creep detected
- Priority conflict between issues

### Getting Help

**Documentation:**
1. [Troubleshooting Guide](./TROUBLESHOOTING.md) - Common issues
2. [Examples](./EXAMPLES.md) - Real-world scenarios
3. [Decision Trees](./DECISION_TREES.md) - Visual flowcharts

**Human Support:**
- Slack: #agent-operations (response time: <2 hours)
- Email: agent-support@company.com
- On-call: For P0/P1 production issues

---

## 📚 Complete Documentation Suite

| Document | Audience | Purpose |
|----------|----------|---------|
| [Quick Start](./QUICK_START.md) | All | 5-min onboarding |
| [Policy Overview](./POLICY_OVERVIEW.md) | Leadership | High-level summary |
| [Mode Reference](./MODE_REFERENCE.md) | Agents, Devs | Complete mode specs |
| [Workflow Guide](./WORKFLOW_GUIDE.md) | Agents | Step-by-step processes |
| [Templates](./TEMPLATES.md) | Agents | Copy/paste formats |
| [Verification Checklist](./VERIFICATION_CHECKLIST.md) | Agents | Final audit steps |
| [Decision Trees](./DECISION_TREES.md) | All | Visual flowcharts |
| [Troubleshooting](./TROUBLESHOOTING.md) | Agents, Devs | Problem solutions |
| [Examples](./EXAMPLES.md) | All | Real-world scenarios |
| [File Rules](./FILE_RULES.md) | Agents, Devs | File access reference |
| [Acceptance Criteria](./ACCEPTANCE_CRITERIA.md) | Reviewers | Quality standards |
| [Integration Guide](./INTEGRATION_GUIDE.md) | Ops, DevOps | Tool setup |
| [Metrics & KPIs](./METRICS.md) | Leadership, PMs | Performance tracking |
| [Continuous Improvement](./CONTINUOUS_IMPROVEMENT.md) | All | Process optimization |

---

## 🎯 Key Takeaways

1. **80% of work is self-service** (Modes 0, 0.5, 1, 2) - High velocity ⚡
2. **Strict file controls** prevent accidental damage - High safety 🛡️
3. **Mandatory verification** before handoff - High quality ✅
4. **Complete audit trail** for all changes - High compliance 📋
5. **Clear escalation paths** for complex scenarios - Low ambiguity 🎯

**Bottom Line:** This system enables autonomous agents to deliver high-velocity, high-quality code changes while maintaining strict safety and governance controls.

---

**Questions?** Contact: agent-operations-team@company.com  
**Last Updated:** 2025-10-15  
**Version:** 1.0
