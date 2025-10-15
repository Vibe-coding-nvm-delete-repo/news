# 📊 Metrics & KPIs - Performance Tracking

**Purpose:** Measure autonomous agent effectiveness, process health, and identify optimization opportunities.

**Audience:** Engineering Leadership, Project Managers, Process Owners

---

## 🎯 Metric Categories

1. [Velocity Metrics](#velocity-metrics)
2. [Quality Metrics](#quality-metrics)
3. [Governance Metrics](#governance-metrics)
4. [Agent Efficiency Metrics](#agent-efficiency-metrics)
5. [Business Impact Metrics](#business-impact-metrics)

---

## ⚡ Velocity Metrics

### 📈 VM-001: PR Turnaround Time

**Definition:** Time from issue assignment to PR merge

**Measurement:**
```bash
# Average time: Issue created → PR merged
gh issue list --state closed --json number,createdAt,closedAt --search "label:agent" \
  | jq -r '.[] | (.closedAt | fromdateiso8601) - (.createdAt | fromdateiso8601)' \
  | awk '{sum+=$1; count++} END {print "Avg:", sum/count/3600, "hours"}'
```

**Targets:**
- Mode 0: <4 hours (assignment to PR ready)
- Mode 3: <24 hours (including approval wait)
- Overall: <6 hours average

**Dashboard Visualization:**
```
PR Turnaround Time (Last 30 Days)
┌────────────────────────────────┐
│ Mode 0:  █████ 3.2h            │
│ Mode 0.5: ███ 1.5h             │
│ Mode 1:  ████ 2.8h             │
│ Mode 2:  ███ 1.9h              │
│ Mode 3:  ████████████ 18.5h    │
└────────────────────────────────┘
Target: <6h avg | Actual: 5.1h ✅
```

---

### 📈 VM-002: Mode 3 Approval Time

**Definition:** Time from override request submission to approval/denial

**Measurement:**
```bash
# Track in PR comments
# Request timestamp: 2025-10-14 10:00
# Approval timestamp: 2025-10-14 16:30
# Delta: 6.5 hours
```

**Targets:**
- P0/P1: <2 hours
- P2: <12 hours
- P3: <24 hours
- Overall: <24 hours average

**Red Flags:**
- >72 hours (triggers auto-freeze)
- >50% requests timeout

---

### 📈 VM-003: Issues Resolved Per Week

**Definition:** Count of issues closed via agent PRs

**Measurement:**
```bash
gh issue list --state closed --json number,closedAt --search "label:agent" \
  --search "closed:>=$(date -d '7 days ago' +%Y-%m-%d)" \
  | jq '. | length'
```

**Targets:**
- Phase 1 (Month 1-2): 5-10/week
- Phase 2 (Month 3-6): 20-50/week
- Phase 3 (Month 7+): 50+/week

**Trend Analysis:**
```
Issues Resolved (Weekly)
Week 1:  ████ 8
Week 2:  ██████ 12
Week 3:  ████████ 15
Week 4:  ██████████ 18
Trend: ↗️ +33% month-over-month
```

---

### 📈 VM-004: Time to First Comment (Human Review)

**Definition:** Time from PR creation to first human comment/review

**Measurement:**
```bash
# Compare PR created timestamp to first non-bot comment
gh pr view <pr-num> --json createdAt,comments
```

**Targets:**
- <2 hours during business hours
- <8 hours overall

**Impact:** Fast reviews → faster iteration

---

## ✅ Quality Metrics

### 📊 QM-001: Verification Pass Rate

**Definition:** % of PRs that pass verification on first attempt

**Measurement:**
```
Pass Rate = (PRs passing verification first time) / (Total PRs)
```

**Calculation:**
```bash
# Track verification failures in PR comments
# Example: 95 PRs pass, 5 require rework
Pass Rate = 95 / 100 = 95% ✅
```

**Targets:**
- Phase 1: >80%
- Phase 2: >90%
- Phase 3: >95%

**Red Flags:**
- <80% (indicates process issues)
- Declining trend (process degradation)

---

### 📊 QM-002: Rework Rate

**Definition:** % of PRs requiring changes after human review

**Measurement:**
```
Rework Rate = (PRs with requested changes) / (Total PRs)
```

**Targets:**
- <10% overall
- <5% for Mode 0

**Categories:**
- Minor: Typos, formatting (acceptable)
- Major: Logic errors, missing tests (concerning)

---

### 📊 QM-003: Test Coverage Trend

**Definition:** Change in overall test coverage over time

**Measurement:**
```bash
# Compare coverage before/after agent PRs
npm test -- --coverage --json > coverage.json
cat coverage.json | jq '.coverageMap.total.statements.pct'
```

**Targets:**
- Coverage maintained (0% change)
- Ideally: Coverage increased (+1-2% per quarter)

**Red Flag:** Coverage decreasing

---

### 📊 QM-004: Linter Warning Trend

**Definition:** Count of new linter warnings introduced (should be 0)

**Measurement:**
```bash
# Before PR
npm run lint -- --max-warnings=0  # Baseline

# After PR
npm run lint -- --max-warnings=0  # Should still pass
```

**Targets:**
- 0 new warnings (enforced)
- 0 violations

**Note:** This should always be 100% due to enforcement

---

### 📊 QM-005: Production Incident Rate

**Definition:** Count of incidents caused by agent-submitted code

**Measurement:**
```
Incident Rate = (Incidents from agent PRs) / (Total agent PRs merged)
```

**Targets:**
- <2% overall
- 0% for P0/P1 severity

**Tracking:**
```markdown
Incident Log:
- 2025-10-12: Memory leak in PR #234 (Mode 0) - P2
  Root Cause: Missing cleanup in useEffect
  Prevention: Added to verification checklist

- 2025-10-15: API timeout in PR #245 (Mode 3) - P1
  Root Cause: Inefficient query (N+1)
  Prevention: Added performance regression check
```

---

### 📊 QM-006: Rollback Rate

**Definition:** % of agent PRs that required rollback/revert

**Measurement:**
```
Rollback Rate = (PRs reverted) / (Total PRs merged)
```

**Targets:**
- <2% overall
- <1% for Mode 0

**Analysis:**
- Why was rollback needed?
- What verification step failed?
- How to prevent in future?

---

## 🛡️ Governance Metrics

### 📋 GM-001: Policy Violation Rate

**Definition:** % of PRs with policy violations (file access, diff budget, etc.)

**Measurement:**
```
Violation Rate = (PRs with violations detected) / (Total PRs)
```

**Targets:**
- 0% (strict enforcement)

**Types:**
- File access violations
- Diff budget exceeded
- Missing mode declaration
- Incorrect commit message format

**Red Flag:** Any violations (indicates enforcement gap)

---

### 📋 GM-002: Mode Distribution

**Definition:** Breakdown of PRs by execution mode

**Measurement:**
```bash
gh pr list --state all --json number,body --search "label:agent" \
  | jq -r '.[] | .body' \
  | grep -oP 'Mode: \K\d' \
  | sort | uniq -c
```

**Expected Distribution:**
- Mode 0: 70-75%
- Mode 0.5: 3-5%
- Mode 1: 2-5%
- Mode 2: 1-3%
- Mode 3: 10-15%
- Mode 4: <5%

**Example:**
```
Mode Distribution (Last 100 PRs)
Mode 0:  ████████████████████ 72%
Mode 0.5: ██ 4%
Mode 1:  ██ 3%
Mode 2:  █ 2%
Mode 3:  ████ 14%
Mode 4:  █ 5%
```

**Analysis:**
- High Mode 3 % → May need to relax allowlists
- High Mode 4 % → Unclear requirements or high complexity issues

---

### 📋 GM-003: Mode 3 Approval Rate

**Definition:** % of Mode 3 requests approved vs denied

**Measurement:**
```
Approval Rate = (Approved requests) / (Total Mode 3 requests)
```

**Targets:**
- 80-95% approval rate

**Analysis:**
- <80%: Agents requesting unnecessarily
- >95%: Approval process may be too lenient

---

### 📋 GM-004: Stale Work Rate

**Definition:** % of issues/PRs that become stale (timeout)

**Measurement:**
```
Stale Rate = (Stale issues/PRs) / (Total issues/PRs)
```

**Targets:**
- <3% overall

**Categories:**
- Stale Mode 3 request (>72hr, no response)
- Stale PR (>10 days, no interaction)

---

### 📋 GM-005: Human Intervention Rate

**Definition:** % of issues requiring human takeover (Mode 4 → Reassign)

**Measurement:**
```
Intervention Rate = (Issues reassigned to human) / (Total issues)
```

**Targets:**
- <10% overall

**Analysis by Reason:**
- Architectural decision needed: 40%
- Security concern: 20%
- Complexity too high: 30%
- Stale/blocked: 10%

---

## 🤖 Agent Efficiency Metrics

### ⚙️ AE-001: First-Time Success Rate

**Definition:** % of PRs merged without requested changes

**Measurement:**
```
First-Time Success = (PRs merged without changes) / (Total PRs)
```

**Targets:**
- >90%

---

### ⚙️ AE-002: Diff Efficiency

**Definition:** Average lines changed per issue

**Measurement:**
```bash
git diff main --stat | tail -1 | awk '{print $4 + $6}'
```

**Targets:**
- Mode 0: 100-200 lines (sweet spot)
- Trend: Decreasing over time (more targeted fixes)

**Analysis:**
- Too low (<50): Overly cautious, missing scope
- Too high (>250): Scope creep, poor decomposition

---

### ⚙️ AE-003: Test-to-Code Ratio

**Definition:** Ratio of test lines to application code lines

**Measurement:**
```bash
# Count test lines
git diff main -- 'tests/**' | grep '^\+' | wc -l

# Count app lines
git diff main -- 'app/**' 'src/**' | grep '^\+' | wc -l

# Ratio
Test Ratio = test_lines / app_lines
```

**Targets:**
- >0.3 (30% test coverage by lines)
- Ideally: 0.5-1.0 (50-100%)

---

### ⚙️ AE-004: Continuous Improvement Proposals

**Definition:** Count of new PQA issues proposed per quarter

**Measurement:**
```bash
# Count "New Issue Proposals" in PR bodies
gh pr list --json body --search "label:agent" \
  | jq -r '.[] | .body' \
  | grep -c "New Issue Proposals"
```

**Targets:**
- >10 proposals per quarter

**Categories:**
- Performance improvements
- Testing enhancements
- Tech debt reduction
- Development flow optimizations

---

## 💼 Business Impact Metrics

### 💰 BI-001: Developer Time Saved

**Definition:** Engineering hours saved by agent automation

**Measurement:**
```
Time Saved = (Issues resolved by agent) × (Avg human time per issue)
```

**Example:**
```
50 issues/month × 2 hours/issue = 100 hours/month saved
100 hours × $100/hour = $10,000/month value
```

**Assumptions:**
- Avg human time for Mode 0 issue: 2-4 hours
- Avg human time for Mode 3 issue: 4-8 hours

---

### 💰 BI-002: Backlog Reduction

**Definition:** Net change in P2/P3 backlog size

**Measurement:**
```bash
# Compare backlog size month-over-month
gh issue list --json number --search "label:P2,P3 is:open" | jq '. | length'
```

**Targets:**
- -10% per quarter (backlog shrinking)

---

### 💰 BI-003: Mean Time to Resolution (MTTR)

**Definition:** Average time from bug report to production fix

**Measurement:**
```
MTTR = (Issue created → PR merged → Deployed)
```

**Targets:**
- P0: <4 hours
- P1: <24 hours
- P2: <1 week
- P3: <2 weeks

---

## 📊 Dashboards & Reporting

### Daily Dashboard (Ops Team)

```markdown
# Agent Operations - Daily Report (2025-10-15)

## 🚀 Velocity
- PRs Opened: 8
- PRs Merged: 6
- Avg Turnaround: 4.2h ✅
- Mode 3 Approvals: 2 (avg 8h) ✅

## ✅ Quality
- Verification Pass Rate: 93% (6/7) ✅
- Linter Violations: 0 ✅
- Test Failures: 0 ✅

## 🚨 Alerts
- 1 PR pending review >24h (PR #456) ⚠️
- 0 stale Mode 3 requests ✅

## 📋 Actions
- [x] Review PR #456 (high priority)
- [ ] Investigate verification failure in PR #458
```

---

### Weekly Report (Leadership)

```markdown
# Agent Program - Weekly Summary (Week of 2025-10-08)

## 📈 Key Metrics
- Issues Resolved: 28 (+12% WoW)
- PRs Merged: 32
- Time Saved: ~60 engineering hours
- Value Generated: ~$6,000

## 🎯 Performance vs Targets
- Turnaround Time: 4.8h (Target: <6h) ✅
- Verification Pass: 91% (Target: >90%) ✅
- Rework Rate: 6% (Target: <10%) ✅
- Rollbacks: 1 (1.8%) ✅

## 🏆 Highlights
- Resolved 8 P2 bugs (backlog -15%)
- Zero production incidents
- 3 new tech debt issues proposed

## ⚠️ Concerns
- Mode 3 approval time increased to 22h (Target: <24h) ⚠️
- 2 stale PRs (>10 days) - both low priority

## 🎯 Next Week Focus
- Reduce Mode 3 approval time
- Close stale PRs
- Onboard 2 new reviewers
```

---

### Monthly Executive Report

```markdown
# Agent Program - Monthly Report (October 2025)

## 📊 Executive Summary
✅ Program on track for Phase 2 targets
✅ Delivered $25K value (saved 250 eng hours)
✅ Quality metrics all green
⚠️ Need to scale reviewer capacity

## 🎯 KPIs vs Targets

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Issues/Month | 50 | 62 | ✅ +24% |
| Turnaround | <6h | 5.1h | ✅ |
| Quality (Pass Rate) | >90% | 93% | ✅ |
| Rollback Rate | <2% | 1.6% | ✅ |
| Mode 3 Approval | <24h | 18.5h | ✅ |
| Backlog Reduction | -10% | -18% | ✅ |

## 💼 Business Impact
- **Cost Savings:** $25,000 (eng time saved)
- **Velocity Increase:** +40% issue resolution rate
- **Quality:** 0 P0/P1 incidents from agent code
- **Backlog:** P2/P3 backlog reduced 18%

## 📚 Learning & Improvements
- Implemented new verification check (performance regression)
- Updated Mode 3 template (reduced approval time 20%)
- Added 4 new troubleshooting guides

## 🚀 Next Month Goals
- Scale to 80+ issues/month
- Reduce Mode 3 approval time to <12h
- Onboard 3 new reviewers
- Launch continuous improvement automation
```

---

## 🔧 Data Collection Setup

### GitHub CLI Queries

```bash
# Save as: scripts/metrics-collect.sh

#!/bin/bash

# PR turnaround time
gh pr list --state closed --json number,createdAt,mergedAt \
  --search "label:agent merged:>=$(date -d '30 days ago' +%Y-%m-%d)"

# Mode distribution
gh pr list --state all --json number,body \
  --search "label:agent created:>=$(date -d '30 days ago' +%Y-%m-%d)" \
  | jq -r '.[] | .body' | grep -oP 'Mode: \K\d' | sort | uniq -c

# Issues resolved
gh issue list --state closed --json number,closedAt \
  --search "label:agent closed:>=$(date -d '7 days ago' +%Y-%m-%d)"
```

---

### Automated Tracking (GitHub Actions)

```yaml
# .github/workflows/metrics-daily.yml
name: Daily Metrics Collection

on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight UTC

jobs:
  collect:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Collect Metrics
        run: bash scripts/metrics-collect.sh
      - name: Post to Dashboard
        run: |
          # Send to monitoring service (Datadog, Grafana, etc.)
          curl -X POST $METRICS_ENDPOINT -d @metrics.json
```

---

## 📚 Related Documentation

- [Policy Overview](./POLICY_OVERVIEW.md) - Context on governance model
- [Verification Checklist](./VERIFICATION_CHECKLIST.md) - Quality gates
- [Integration Guide](./INTEGRATION_GUIDE.md) - Tool setup

---

**Last Updated:** 2025-10-15  
**Version:** 1.0
