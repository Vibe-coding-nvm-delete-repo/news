# 🔌 Integration Guide - Tool & System Setup

**Purpose:** Configure CI/CD, issue tracking, monitoring, and automation to support autonomous agent operations.

**Audience:** DevOps, Platform Engineers, Engineering Managers

---

## 📑 Integration Areas

1. [Issue Tracking](#issue-tracking-github-issues)
2. [Pull Request Workflow](#pull-request-workflow-github)
3. [CI/CD Pipeline](#cicd-pipeline)
4. [Code Quality Tools](#code-quality-tools)
5. [Monitoring & Observability](#monitoring--observability)
6. [Communication](#communication-slack-email)
7. [Metrics Dashboard](#metrics-dashboard)

---

## 🎫 Issue Tracking (GitHub Issues)

### Labels Setup

**Required Labels:**

```bash
# Agent-related
gh label create "agent" --color "0E8A16" --description "Issue assigned to autonomous agent"
gh label create "agent-ready" --color "1D76DB" --description "Issue ready for agent assignment"
gh label create "agent-blocked" --color "D93F0B" --description "Agent work blocked/stalled"

# Priority
gh label create "P0" --color "B60205" --description "Critical (fix immediately)"
gh label create "P1" --color "D93F0B" --description "High priority"
gh label create "P2" --color "FBCA04" --description "Medium priority"
gh label create "P3" --color "0E8A16" --description "Low priority"

# Mode tracking
gh label create "mode-0" --color "C5DEF5" --description "Normal mode"
gh label create "mode-1" --color "BFD4F2" --description "LTRM mode"
gh label create "mode-2" --color "D4C5F9" --description "CI Repair mode"
gh label create "mode-3" --color "F9C5D4" --description "Scoped Override mode"
gh label create "mode-4" --color "FBCA04" --description "Emergency Freeze mode"
```

---

### Issue Templates

**Create:** `.github/ISSUE_TEMPLATE/agent-bug-fix.md`

```markdown
---
name: Agent Bug Fix
about: Bug report for autonomous agent assignment
labels: agent-ready, P2
---

## Bug Description

<!-- Clear description of the bug -->

## Steps to Reproduce

1.
2.
3.

## Expected Behavior

<!-- What should happen -->

## Actual Behavior

<!-- What actually happens -->

## Environment

- Browser/Node version:
- OS:

## Acceptance Criteria

- [ ] Bug is fixed
- [ ] Regression test added
- [ ] No related bugs introduced

## Agent Assignment Checklist

- [ ] Reproducible with clear steps
- [ ] Scoped to app/src/tests/docs (Mode 0 eligible)
- [ ] Estimated <300 lines, <4 files
- [ ] No runtime dependencies needed

## Additional Context

<!-- Screenshots, logs, links -->
```

---

**Create:** `.github/ISSUE_TEMPLATE/agent-feature.md`

```markdown
---
name: Agent Feature
about: Feature request for autonomous agent implementation
labels: agent-ready, P3
---

## Feature Description

<!-- What feature to implement -->

## User Story

As a [user type], I want [goal] so that [benefit].

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Design/Mockups

<!-- Figma links, wireframes, etc. -->

## Technical Notes

<!-- Implementation hints, constraints -->

## Agent Assignment Checklist

- [ ] Requirements are clear and unambiguous
- [ ] Scoped to Mode 0 (or Mode 3 override documented)
- [ ] Estimated <300 lines, <4 files
- [ ] No architectural decisions needed

## Out of Scope

<!-- What this issue does NOT include -->
```

---

### Issue Assignment Automation

**Create:** `.github/workflows/agent-assign.yml`

```yaml
name: Agent Assignment

on:
  issues:
    types: [labeled]

jobs:
  assign-agent:
    if: github.event.label.name == 'agent-ready'
    runs-on: ubuntu-latest
    steps:
      - name: Add agent assignment comment
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `
                🤖 **Agent Assignment**

                This issue has been flagged as ready for autonomous agent processing.

                **Next Steps:**
                1. Agent will analyze requirements
                2. Create branch: \`ai/${context.issue.number}-[description]-[timestamp]\`
                3. Implement fix/feature per policy
                4. Open PR for human review

                **Estimated Time:** Based on complexity and mode selection

                📚 [Agent Policy Docs](../docs/agent-policies/README.md)
              `
            });

      - name: Set project board status
        # Move to "Agent In Progress" column
        run: |
          gh api --method POST /projects/columns/<COLUMN_ID>/cards \
            -f content_id=${{ github.event.issue.id }} \
            -f content_type=Issue
```

---

## 🔄 Pull Request Workflow (GitHub)

### PR Templates

**Create:** `.github/PULL_REQUEST_TEMPLATE.md`

```markdown
## Summary

<!-- Brief description of changes -->

Fixes #<ISSUE_NUMBER>

## Changes

- Change 1
- Change 2
- Change 3

## Root Cause Analysis (for bug fixes)

<!-- 3-5 lines explaining why the bug occurred -->

## How to Verify

1. Checkout this branch
2. Run: `npm test`
3. Expected result: All tests pass

## Tests Added/Modified

- `path/to/test.ts`: Description of what it tests

## Risks & Limitations

- Risk 1 or "None identified"
- Limitation 1 or "None"

## 🧩 Conformance

- **Policy Mode:** Mode <N>
- **Reason:** <why this mode was used>
- **Diff:** <X> lines, <Y> files (Budget: <mode-budget>)
- **Standards:** Verified per ENGINEERING_STANDARDS.md (if exists)

## Acceptance Criteria

- [ ] `npm run lint -- --max-warnings=0`
- [ ] `npx tsc --noEmit`
- [ ] `npm test -- --runInBand`
- [ ] `npm run build`
- [ ] Behavior verified (see steps above)
- [ ] No scope creep

<!-- If applicable: -->

## 💡 New Issue Proposals

<!-- Tech debt or improvements identified during work -->

---

**🤖 Generated by:** Autonomous Agent  
**📋 Policy Version:** 1.0
```

---

### PR Auto-Labeling

**Create:** `.github/workflows/pr-labeler.yml`

```yaml
name: PR Auto-Labeler

on:
  pull_request:
    types: [opened, edited]

jobs:
  label:
    runs-on: ubuntu-latest
    steps:
      - name: Extract mode from PR body
        uses: actions/github-script@v7
        with:
          script: |
            const body = context.payload.pull_request.body || '';
            const modeMatch = body.match(/Mode:\s*(\d)/);

            if (modeMatch) {
              const mode = modeMatch[1];
              await github.rest.issues.addLabels({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.payload.pull_request.number,
                labels: [`mode-${mode}`]
              });
            }

      - name: Check for /ai prefix
        uses: actions/github-script@v7
        with:
          script: |
            const title = context.payload.pull_request.title;
            if (title.startsWith('/ai ')) {
              await github.rest.issues.addLabels({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.payload.pull_request.number,
                labels: ['agent']
              });
            } else {
              core.setFailed('PR title must start with /ai prefix');
            }
```

---

### PR Size Check

**Create:** `.github/workflows/pr-size-check.yml`

```yaml
name: PR Size Check

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  check-size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Check diff budget
        run: |
          # Extract mode from PR body
          MODE=$(gh pr view ${{ github.event.pull_request.number }} --json body -q '.body' | grep -oP 'Mode: \K\d')

          # Set budget based on mode
          case $MODE in
            0) MAX_LINES=300; MAX_FILES=4 ;;
            0.5) MAX_LINES=50; MAX_FILES=2 ;;
            1) MAX_LINES=120; MAX_FILES=2 ;;
            2) MAX_LINES=50; MAX_FILES=2 ;;
            3) MAX_LINES=9999; MAX_FILES=99 ;; # Check against approval
            *) echo "Unknown mode"; exit 1 ;;
          esac

          # Count diff
          STAT=$(git diff --stat origin/main...HEAD | tail -1)
          FILES=$(echo $STAT | awk '{print $1}')
          LINES=$(echo $STAT | awk '{print $4 + $6}')

          echo "Mode: $MODE | Files: $FILES/$MAX_FILES | Lines: $LINES/$MAX_LINES"

          # Check budget
          if [ $FILES -gt $MAX_FILES ] || [ $LINES -gt $MAX_LINES ]; then
            echo "❌ Diff budget exceeded!"
            exit 1
          fi

          echo "✅ Within diff budget"
        env:
          GH_TOKEN: ${{ github.token }}
```

---

## 🏗️ CI/CD Pipeline

### Required Checks Workflow

**Create:** `.github/workflows/agent-pr-checks.yml`

```yaml
name: Agent PR Checks

on:
  pull_request:
    types: [opened, synchronize]
    paths:
      - 'app/**'
      - 'src/**'
      - 'tests/**'
      - 'package.json'

jobs:
  lint:
    name: Lint (Zero Warnings)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint -- --max-warnings=0

  typecheck:
    name: TypeScript Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx tsc --noEmit

  test:
    name: Test Suite
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --runInBand --coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  build:
    name: Production Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Check bundle size
        run: |
          # Install size-limit if not already
          npm run size || echo "No size check configured"
```

---

### Status Checks Enforcement

**Configure in GitHub Settings → Branches → Branch Protection:**

```yaml
Required status checks: ✅ Lint (Zero Warnings)
  ✅ TypeScript Check
  ✅ Test Suite
  ✅ Production Build
  ✅ PR Size Check

Require branches to be up to date: ✅
Require review before merging: ✅ (1 approval minimum)
Dismiss stale reviews: ✅
Require review from Code Owners: ✅ (if CODEOWNERS exists)
```

---

## 🔍 Code Quality Tools

### ESLint Configuration

**Ensure strict settings in `eslint.config.js`:**

```javascript
export default [
  {
    rules: {
      // Enforce zero console.log
      'no-console': ['error', { allow: ['warn', 'error'] }],

      // Enforce zero debugger
      'no-debugger': 'error',

      // Enforce no unused vars
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // TypeScript specific
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
];
```

---

### TypeScript Configuration

**Ensure strict settings in `tsconfig.json`:**

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

---

## 📊 Monitoring & Observability

### Sentry Integration (Error Tracking)

```bash
npm install @sentry/nextjs
```

**Configure: `sentry.client.config.js`**

```javascript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Tag agent-submitted code
  beforeSend(event, hint) {
    // Add custom tag for agent PRs
    event.tags = event.tags || {};
    event.tags.agent_pr = 'check_git_log'; // Implement git log check
    return event;
  },

  tracesSampleRate: 0.1,
});
```

**Track agent-caused incidents:**

```bash
# Query Sentry for agent-tagged errors
curl -H "Authorization: Bearer $SENTRY_TOKEN" \
  "https://sentry.io/api/0/organizations/$ORG/issues/?query=tags[agent_pr]:true"
```

---

### Datadog / New Relic (APM)

**Tag deployments with agent metadata:**

```yaml
# .github/workflows/deploy.yml
- name: Notify deployment
  run: |
    # Check if deployment includes agent PRs
    AGENT_PRS=$(gh pr list --state merged --search "label:agent merged:>=$(date -d '1 day ago' +%Y-%m-%d)" --json number | jq '.[].number')

    # Send to Datadog
    curl -X POST "https://api.datadoghq.com/api/v1/events" \
      -H "DD-API-KEY: ${DD_API_KEY}" \
      -d "{
        \"title\": \"Deployment with agent PRs\",
        \"text\": \"PRs: $AGENT_PRS\",
        \"tags\": [\"source:agent\", \"env:production\"]
      }"
```

---

## 💬 Communication (Slack/Email)

### Slack Notifications

**Create:** `.github/workflows/agent-notify.yml`

```yaml
name: Agent Notifications

on:
  pull_request:
    types: [opened, ready_for_review]
  issues:
    types: [labeled]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: PR Opened Notification
        if: github.event_name == 'pull_request' && github.event.action == 'opened'
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "🤖 New Agent PR Ready for Review",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*${{ github.event.pull_request.title }}*\n<${{ github.event.pull_request.html_url }}|View PR>"
                  }
                },
                {
                  "type": "context",
                  "elements": [
                    {
                      "type": "mrkdwn",
                      "text": "Mode: Extract from body | Files: X | Lines: Y"
                    }
                  ]
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_AGENT_CHANNEL }}

      - name: Mode 3 Override Request
        if: contains(github.event.issue.body, 'OVERRIDE REQUEST')
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "🚨 Mode 3 Override Request - Approval Needed",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Issue #${{ github.event.issue.number }}*\n<${{ github.event.issue.html_url }}|Review Request>"
                  }
                },
                {
                  "type": "actions",
                  "elements": [
                    {
                      "type": "button",
                      "text": {"type": "plain_text", "text": "Approve"},
                      "style": "primary",
                      "url": "${{ github.event.issue.html_url }}"
                    },
                    {
                      "type": "button",
                      "text": {"type": "plain_text", "text": "Deny"},
                      "style": "danger",
                      "url": "${{ github.event.issue.html_url }}"
                    }
                  ]
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_APPROVALS }}
```

---

## 📈 Metrics Dashboard

### Grafana Dashboard (Example)

**Data Source:** GitHub API + Custom Metrics Collector

**Panels:**

1. **Velocity Panel:**
   - PR turnaround time (line graph)
   - Issues resolved per week (bar chart)
   - Mode 3 approval time (gauge)

2. **Quality Panel:**
   - Verification pass rate (%)
   - Test coverage trend (line)
   - Rollback rate (%)

3. **Mode Distribution Panel:**
   - Pie chart of Mode 0/0.5/1/2/3/4 usage

4. **Alerts Panel:**
   - Stale PRs (>10 days)
   - Pending Mode 3 requests (>48hrs)
   - Recent rollbacks

**Query Example (Prometheus/PromQL):**

```promql
# PR turnaround time (hours)
avg_over_time(agent_pr_turnaround_hours[7d])

# Verification pass rate (%)
(agent_verification_pass / agent_verification_total) * 100
```

---

## 🔗 Integration Checklist

**Before going live:**

### GitHub Setup

- [ ] Labels created
- [ ] Issue templates configured
- [ ] PR template configured
- [ ] Branch protection rules enabled
- [ ] Required status checks configured
- [ ] CODEOWNERS file (optional)

### CI/CD

- [ ] Linter workflow (--max-warnings=0)
- [ ] TypeScript check workflow
- [ ] Test suite workflow
- [ ] Build workflow
- [ ] PR size check workflow

### Quality Tools

- [ ] ESLint strict config
- [ ] TypeScript strict config
- [ ] Test coverage reporting
- [ ] Bundle size tracking (optional)

### Monitoring

- [ ] Error tracking (Sentry/Rollbar)
- [ ] APM integration (Datadog/New Relic)
- [ ] Deployment tracking with agent tags

### Communication

- [ ] Slack notifications for PR opens
- [ ] Slack notifications for Mode 3 requests
- [ ] Email alerts for stale work (optional)

### Metrics

- [ ] Daily metrics collection script
- [ ] Weekly report automation
- [ ] Dashboard (Grafana/Datadog/custom)

---

## 📚 Related Documentation

- [Policy Overview](./POLICY_OVERVIEW.md) - Governance context
- [Metrics & KPIs](./METRICS.md) - What to track
- [Workflow Guide](./WORKFLOW_GUIDE.md) - Agent processes

---

**Last Updated:** 2025-10-15  
**Version:** 1.0
