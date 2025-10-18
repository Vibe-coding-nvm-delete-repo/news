/**
 * PolicyViewer Component
 *
 * An interactive, responsive policy document viewer optimized for:
 * - Desktop (Mac, Windows, Linux) with Chrome and other browsers
 * - Mobile devices (iOS, Android)
 * - Accessibility (WCAG 2.1 AA compliant)
 * - Print-friendly output
 *
 * Features:
 * - Collapsible sections with smooth animations
 * - Search and filter functionality
 * - Sticky table of contents
 * - Dark mode support
 * - Mobile-optimized navigation
 * - Touch-friendly interactions
 */
'use client';

import { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Search,
  Moon,
  Sun,
  Menu,
  X,
  FileText,
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  GitBranch,
  FileCheck,
  ScanSearch,
} from 'lucide-react';

interface Section {
  id: string;
  title: string;
  emoji: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  subsections?: Section[];
}

export default function PolicyViewer() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['overview'])
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAllSections = (expand: boolean) => {
    if (expand) {
      setExpandedSections(new Set(sections.map(s => s.id)));
    } else {
      setExpandedSections(new Set());
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(`section-${id}`);
    if (element) {
      const offset = 80; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      // Expand section if collapsed
      if (!expandedSections.has(id)) {
        toggleSection(id);
      }

      // Close mobile menu after navigation
      setIsMobileMenuOpen(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sections: Section[] = [
    {
      id: 'overview',
      title: 'Overview',
      emoji: '🤖',
      icon: <FileText className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-lg leading-relaxed">
            This policy defines the <strong>strict boundaries</strong>,{' '}
            <strong>file allowlists/denylists</strong>, and{' '}
            <strong>mandatory escalation process</strong> to ensure auditable,
            minimal, and safe code changes.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Key Principles
            </h4>
            <ul className="space-y-2 text-blue-800 dark:text-blue-200">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>Safety through restricted file access</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>Auditability with clear mode declarations</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>Velocity with 80%+ auto-approval rate</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'modes',
      title: 'Decision Escalation Ladder',
      emoji: '🔢',
      icon: <Shield className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <p className="text-lg">
            The escalation ladder defines how the AI may expand scope based on
            the situation.
          </p>

          {/* Mode 0 */}
          <div className="border border-green-200 dark:border-green-800 rounded-lg overflow-hidden">
            <div className="bg-green-50 dark:bg-green-900/20 px-6 py-4 border-b border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-green-900 dark:text-green-100">
                  Mode 0 — Normal (Default)
                </h3>
                <span className="px-3 py-1 bg-green-600 text-white text-sm font-semibold rounded-full">
                  No Approval
                </span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Standard bug fix or feature implementation tied to an issue
                number.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                    ✅ Allow:
                  </h4>
                  <ul className="space-y-1 text-sm">
                    <li className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      app/**
                    </li>
                    <li className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      src/**
                    </li>
                    <li className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      tests/**
                    </li>
                    <li className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      docs/**
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                    🚫 Deny:
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    All root configs, dependencies, and CI{' '}
                    <strong>UNLESS</strong> you believe unequivocally and
                    conclusively that these must be changed to fix a core issue.
                  </p>
                </div>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg">
                <p className="font-semibold text-green-900 dark:text-green-100">
                  ⚡ Action: Proceed immediately
                </p>
              </div>
            </div>
          </div>

          {/* Mode 0.5 */}
          <div className="border border-teal-200 dark:border-teal-800 rounded-lg overflow-hidden">
            <div className="bg-teal-50 dark:bg-teal-900/20 px-6 py-4 border-b border-teal-200 dark:border-teal-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-teal-900 dark:text-teal-100">
                  Mode 0.5 — Self-Initiated Refactor
                </h3>
                <span className="px-3 py-1 bg-teal-600 text-white text-sm font-semibold rounded-full">
                  No Approval
                </span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Small, beneficial technical debt reduction (e.g., dead code
                removal, small type-cleanup) not tied to an existing issue.
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold text-teal-800 dark:text-teal-200">
                  Scope Rules:
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 dark:text-teal-400 font-bold">
                      •
                    </span>
                    <span>
                      Must NOT include adding/removing dependencies or changing
                      logic
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 dark:text-teal-400 font-bold">
                      •
                    </span>
                    <span>Max diff: ≤50 lines, ≤2 files</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 dark:text-teal-400 font-bold">
                      •
                    </span>
                    <span>Allow: app/**, src/**, tests/**</span>
                  </li>
                </ul>
              </div>
              <div className="bg-teal-100 dark:bg-teal-900/30 p-4 rounded-lg">
                <p className="font-semibold text-teal-900 dark:text-teal-100">
                  ⚡ Action: Announce switch, proceed immediately. Must use{' '}
                  <code className="bg-teal-200 dark:bg-teal-800 px-2 py-0.5 rounded">
                    refactor:
                  </code>{' '}
                  commit prefix.
                </p>
              </div>
            </div>
          </div>

          {/* Mode 1 */}
          <div className="border border-blue-200 dark:border-blue-800 rounded-lg overflow-hidden">
            <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-4 border-b border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                  Mode 1 — LTRM (Local Tooling Repair Mode)
                </h3>
                <span className="px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">
                  No Approval
                </span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Used ONLY when baseline test/typecheck fails due to local
                configuration issues (Jest/tsconfig/scripts).
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                  Temporarily Allow:
                </h4>
                <ul className="space-y-1 text-sm">
                  <li className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    jest.config.*
                  </li>
                  <li className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    tsconfig*.json
                  </li>
                  <li className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    tests/setup*.ts
                  </li>
                  <li className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    package.json (scripts + devDependencies only)
                  </li>
                  <li className="text-gray-600 dark:text-gray-400">
                    Allow ONE devDep addition (@swc/jest or ts-jest)
                  </li>
                  <li className="text-gray-600 dark:text-gray-400">
                    Allow lockfile modification if a devDep is added
                  </li>
                </ul>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg">
                <p className="font-semibold text-blue-900 dark:text-blue-100">
                  ⚡ Action: Announce switch, proceed immediately. Diff ≤120
                  lines, ≤2 files. Must include 3–5 line RCA in commit.
                </p>
              </div>
            </div>
          </div>

          {/* Mode 2 */}
          <div className="border border-purple-200 dark:border-purple-800 rounded-lg overflow-hidden">
            <div className="bg-purple-50 dark:bg-purple-900/20 px-6 py-4 border-b border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100">
                  Mode 2 — CI_REPAIR_MODE
                </h3>
                <span className="px-3 py-1 bg-purple-600 text-white text-sm font-semibold rounded-full">
                  No Approval
                </span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Used when workflows under .github/** are broken at baseline.
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold text-purple-800 dark:text-purple-200">
                  Scope Rules:
                </h4>
                <p className="text-sm">
                  Only{' '}
                  <code className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    .github/**
                  </code>{' '}
                  is allowed.
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-lg">
                <p className="font-semibold text-purple-900 dark:text-purple-100">
                  ⚡ Action: Follow your CI-Repair Protocol (canary, tiny diff,
                  pinned versions).
                </p>
              </div>
            </div>
          </div>

          {/* Mode 3 */}
          <div className="border border-orange-200 dark:border-orange-800 rounded-lg overflow-hidden">
            <div className="bg-orange-50 dark:bg-orange-900/20 px-6 py-4 border-b border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-orange-900 dark:text-orange-100">
                  Mode 3 — Scoped Override
                </h3>
                <span className="px-3 py-1 bg-orange-600 text-white text-sm font-semibold rounded-full">
                  ✅ Approval Required
                </span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                A solution necessarily touches items outside Modes 0-2 (runtime
                deps, root configs, infra, or large asset addition).
              </p>
              <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-lg">
                <p className="font-semibold text-orange-900 dark:text-orange-100">
                  🛑 Action: Stop. Request human approval (must receive
                  APPROVED_OVERRIDE token).
                </p>
                <p className="text-sm mt-2 text-orange-800 dark:text-orange-200">
                  Changes are limited only to paths explicitly listed in the
                  approved request.
                </p>
              </div>
            </div>
          </div>

          {/* Mode 4 */}
          <div className="border border-red-200 dark:border-red-800 rounded-lg overflow-hidden">
            <div className="bg-red-50 dark:bg-red-900/20 px-6 py-4 border-b border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-red-900 dark:text-red-100">
                  Mode 4 — Emergency Freeze
                </h3>
                <span className="px-3 py-1 bg-red-600 text-white text-sm font-semibold rounded-full">
                  ✅ Approval Required
                </span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Risk is high, impact is unknown, ambiguity remains, or work is
                stalled pending human review.
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold text-red-800 dark:text-red-200">
                  Scope Rules:
                </h4>
                <p className="text-sm">No file modifications allowed.</p>
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg">
                <p className="font-semibold text-red-900 dark:text-red-100">
                  🛑 Action: Stop. Report status and request immediate human
                  direction.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'override-request',
      title: 'Override Request Template (Mode 3)',
      emoji: '🚨',
      icon: <AlertTriangle className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4">
            <p className="font-semibold text-red-900 dark:text-red-100 mb-2">
              The agent MUST use this template when proposing a Scoped Override
              (Mode 3).
            </p>
          </div>

          <div className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-6 rounded-lg overflow-x-auto">
            <pre className="text-sm whitespace-pre-wrap break-words">
              {`🚨 OVERRIDE REQUEST (Mode 3 — Scoped)

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
- Est diff: ~<lines>, <files>
  (Note: Diff budget applies to code/text; non-text assets are reviewed case-by-case)
- Dependency change: [npm install/update/remove, or N/A]
- Security/License Check: [brief summary of security review or N/A]
- Versioning Preference: [State preference: Caret (^), Tilde (~), or Pinned version]
- Rollback: \`git revert <sha>\` (single commit)
- Tests added: [file]
- Timebox: <N> hours

Evidence pack:
- Repro commands + outputs (tsc/test/build)
- Exact failing lines (file:line)
- Links (logs/builds)

APPROVAL NEEDED:
Reply with: APPROVE OVERRIDE: Mode 3 (Option X) and I'll proceed.`}
            </pre>
          </div>
        </div>
      ),
    },
    {
      id: 'work-order',
      title: 'Agent Work Order',
      emoji: '📋',
      icon: <FileCheck className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Core Policy & File Access
            </h4>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li>
                <strong>Read vs. Write:</strong> The agent is always permitted
                to read any file for context, but can only modify files listed
                in the current approved Mode&apos;s allowlist.
              </li>
              <li>
                <strong>Non-Text Assets:</strong> Adding non-text assets
                (images, fonts, binaries) is not permitted in Modes 0, 0.5, 1,
                or 2. They require Mode 3 Scoped Override approval due to
                potential repo size/licensing implications.
              </li>
              <li>
                <strong>Initial Mode:</strong> Start in Mode 0 (Normal).
              </li>
              <li>
                <strong>Diff Budget:</strong> ≤300 lines, ≤4 files. No runtime
                deps.
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-bold">6-Step Workflow</h3>

            {/* Step 1 */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Step 1 — Reproduce (Branch Setup)
              </h4>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                The agent MUST create a new, distinct branch for every issue,
                starting with the{' '}
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                  /ai
                </code>{' '}
                prefix.
              </p>
              <div className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">
                  {`git fetch origin
git switch -c ai/[ISSUE_NUMBER]-[kebab]-[YYYYMMDDHHmm] [BASE_REF]

npm ci
npx tsc --noEmit || true
npm run build || true
npm test -- --runInBand || true`}
                </pre>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Paste exact failures; declare Mode 1/2 need if applicable.
                Otherwise prepare Mode 3 request.
              </p>
            </div>

            {/* Step 2 */}
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="text-xl font-semibold text-purple-900 dark:text-purple-100 mb-2">
                Step 2 — Plan
              </h4>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>
                  • <strong>Complexity Check:</strong> If estimated change
                  exceeds Mode 0 budget by &gt;50% (&gt;450 lines or &gt;6
                  files), propose breaking into smaller sub-tasks.
                </li>
                <li>
                  • <strong>Technical Debt Review:</strong> Include findings or
                  New Issue Proposals from Continuous Improvement Mandate.
                </li>
                <li>• Files to edit/create (exact list).</li>
                <li>• Assumptions (≤3).</li>
                <li>• In scope (≤3) / Out of scope (≤3).</li>
                <li>• Cite relevant docs/ENGINEERING_STANDARDS.md rules.</li>
              </ul>
            </div>

            {/* Step 3 */}
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-2">
                Step 3 — Implement
              </h4>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>• Make minimal diffs in the currently approved mode.</li>
                <li>• Add/adjust one unit test.</li>
                <li>
                  • Pre-commit guard: Enforce allowlist/denylist & diff budget
                  per mode.
                </li>
                <li>
                  • If APPROVED_OVERRIDE is set, ensure staged files ⊆
                  PROPOSED_FILES.txt.
                </li>
              </ul>
              <div className="mt-3 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                <h5 className="font-semibold text-sm mb-2">
                  Commit message format:
                </h5>
                <pre className="text-xs bg-gray-900 dark:bg-gray-950 text-gray-100 p-3 rounded overflow-x-auto">
                  {`fix: [short-name] (Fixes #[ISSUE_NUMBER])
Mode: [0|0.5 Refactor|1 LTRM|2 CI_REPAIR|3 Scoped]
RCA: [3–5 lines]
Minimal fix: [1–2 lines]
Tests: [file]`}
                </pre>
              </div>
            </div>

            {/* Step 4 */}
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-2">
                Step 4 — PR Hygiene (Review Preparation)
              </h4>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Confirm no unapproved paths, all checks green, small diff +
                tests.
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                <h5 className="font-semibold text-sm mb-2">
                  PR body must include:
                </h5>
                <ul className="text-sm space-y-1">
                  <li>• What/Why/How-to-verify</li>
                  <li>• Risks/Limitations</li>
                  <li>
                    • 🧩 Conformance: Verified per [ENGINEERING_STANDARDS.md]
                  </li>
                  <li>• Mode used: [0|0.5|1|2|3], Reason: [short]</li>
                  <li>• [New Issue Proposals (if applicable)]</li>
                </ul>
              </div>
            </div>

            {/* Step 5 */}
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-2">
                Step 5 — Open PR (Non-Merging Policy)
              </h4>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>
                  • <strong>PR Title:</strong> MUST start with{' '}
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                    /ai
                  </code>{' '}
                  prefix
                </li>
                <li>
                  • <strong>Merging Policy:</strong> The agent MUST NEVER merge
                  its own Pull Requests
                </li>
                <li>• Return PR URL, changed files list, test summary</li>
              </ul>
            </div>

            {/* Step 6 */}
            <div className="border-l-4 border-teal-500 pl-4">
              <h4 className="text-xl font-semibold text-teal-900 dark:text-teal-100 mb-2">
                Step 6 — Final Review & Handoff
              </h4>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>• Confirm cross-link to issue is in PR description</li>
                <li>
                  • Ensure all Acceptance Criteria were met and documented
                </li>
                <li>• Verify all required links (logs/builds) are present</li>
                <li>• Report current CI status</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'acceptance',
      title: 'Acceptance Criteria',
      emoji: '✅',
      icon: <CheckCircle className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            Every PR must pass all acceptance criteria before handoff:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                title: 'Lint',
                cmd: 'npm run lint -- --max-warnings=0',
                desc: 'Zero warnings enforced',
              },
              {
                title: 'Type Check',
                cmd: 'npx tsc --noEmit',
                desc: 'Zero type errors',
              },
              {
                title: 'Tests',
                cmd: 'npm test -- --runInBand',
                desc: 'Add/adjust ≥1 unit test',
              },
              {
                title: 'Build',
                cmd: 'npm run build',
                desc: 'Production build succeeds',
              },
            ].map((check, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold">{check.title}</h4>
                </div>
                <code className="text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded block mb-2 break-all">
                  {check.cmd}
                </code>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {check.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
              Non-Functional Checks
            </h4>
            <ul className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
              <li>
                <strong>Performance:</strong> No significant performance
                regression (memory, UI blocking, latency)
              </li>
              <li>
                <strong>Security:</strong> No new vulnerabilities; no hardcoded
                secrets
              </li>
              <li>
                <strong>i18n:</strong> No hardcoded user-facing strings in
                source files
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              ✅ Behavior verified (steps in PR) <br />
              ✅ Diff within budget & approved mode <br />✅ No scope creep
              beyond approved mode(s)
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'stale-work',
      title: 'Stale Work Policy',
      emoji: '⏰',
      icon: <Clock className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="border border-orange-200 dark:border-orange-800 rounded-lg p-4 bg-orange-50 dark:bg-orange-900/20">
            <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-3">
              Mode 3 Blockage
            </h4>
            <p className="text-orange-800 dark:text-orange-200">
              If the agent submits a Mode 3 Override Request and does not
              receive a response (approval or denial) within{' '}
              <strong>72 hours</strong>, the agent MUST automatically switch to{' '}
              <strong>Mode 4 (Emergency Freeze)</strong>, report the issue as
              Stalled, and stop work on the task.
            </p>
          </div>

          <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
            <h4 className="font-semibold text-red-900 dark:text-red-100 mb-3">
              Stale PR Branch
            </h4>
            <p className="text-red-800 dark:text-red-200">
              If a Pull Request (PR) has been open for <strong>10 days</strong>{' '}
              with pending requested changes or without human interaction, the
              agent MUST automatically switch to{' '}
              <strong>Mode 4 (Emergency Freeze)</strong>, mark the PR as Stale,
              and request human re-triage or closure.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'continuous-improvement',
      title: 'Continuous Improvement Mandate',
      emoji: '🔄',
      icon: <Zap className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            The agent is mandated to prioritize code health and process
            efficiency.
          </p>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                TD Identification
              </h4>
              <p className="text-gray-700 dark:text-gray-300">
                During planning and implementation, the agent MUST actively look
                for opportunities to reduce unnecessary technical debt, improve
                testing (coverage/speed/clarity), or optimize development flow.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Scope Boundary
              </h4>
              <p className="text-gray-700 dark:text-gray-300">
                If an identified improvement/bug is outside the current
                issue&apos;s direct scope and cannot be handled safely under
                Mode 0.5 (Self-Initiated Refactor), the agent MUST NOT implement
                the fix in the current PR.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                New Issue Proposal
              </h4>
              <p className="text-blue-800 dark:text-blue-200">
                The agent must draft a proposal for a new issue containing the
                scope, justification, and estimated complexity for the
                recommended change. This proposal must be included in the PR
                body for review.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'pqa-policy',
      title: 'Proactive Quality Assurance (PQA) Policy',
      emoji: '🔍',
      icon: <ScanSearch className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <p className="text-lg">
            The PQA Policy defines systematic codebase scanning and issue
            identification procedures for quality assurance agents.
          </p>

          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Mission: Identification Only (No Fixes)
            </h4>
            <p className="text-purple-800 dark:text-purple-200">
              The agent in PQA mode MUST NOT attempt to fix any discovered
              issues. Its task is strictly identification and reporting.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Scanning Modes
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  id: 'S-1',
                  title: 'Code Scrutiny',
                  focus: 'Technical Debt & Quality',
                  color: 'blue',
                  items: [
                    'Unused variables/imports',
                    'Excessive function complexity',
                    'Code duplication',
                    'Developer friction debt',
                  ],
                },
                {
                  id: 'S-2',
                  title: 'Log & Runtime Analysis',
                  focus: 'Live system errors',
                  color: 'red',
                  items: [
                    'Build warnings/errors',
                    'Security vulnerabilities',
                    'External API contract failures',
                    'Silent type coercion',
                  ],
                },
                {
                  id: 'S-3',
                  title: 'Performance & Efficiency',
                  focus: 'Resource usage',
                  color: 'orange',
                  items: [
                    'Slow tests (≥2s)',
                    'Large bundle sizes',
                    'Excessive re-renders',
                    'N+1 query patterns',
                  ],
                },
                {
                  id: 'S-4',
                  title: 'Policy & Standards',
                  focus: 'Standard violations',
                  color: 'yellow',
                  items: [
                    'Hardcoded strings (i18n)',
                    'Missing error handling',
                    'Console statements',
                    'CODE_STYLE.md violations',
                  ],
                },
                {
                  id: 'S-5',
                  title: 'UX & Accessibility',
                  focus: 'WCAG compliance',
                  color: 'green',
                  items: [
                    'Missing ARIA attributes',
                    'Poor color contrast',
                    'Keyboard navigation gaps',
                    'Confusing error messages',
                  ],
                },
                {
                  id: 'S-6',
                  title: 'Environment & Legacy Drift',
                  focus: 'Operational risk',
                  color: 'purple',
                  items: [
                    'Config drift across environments',
                    'Duplicate directories',
                    'Orphaned/legacy code',
                    'Deprecated dependencies',
                  ],
                },
              ].map((mode, idx) => (
                <div
                  key={idx}
                  className={`border border-${mode.color}-200 dark:border-${mode.color}-800 rounded-lg p-4 bg-${mode.color}-50 dark:bg-${mode.color}-900/20`}
                >
                  <h4
                    className={`font-semibold text-${mode.color}-900 dark:text-${mode.color}-100 mb-2`}
                  >
                    {mode.id}: {mode.title}
                  </h4>
                  <p
                    className={`text-sm text-${mode.color}-800 dark:text-${mode.color}-200 mb-3`}
                  >
                    <strong>Focus:</strong> {mode.focus}
                  </p>
                  <ul
                    className={`text-sm space-y-1 text-${mode.color}-700 dark:text-${mode.color}-300`}
                  >
                    {mode.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Priority Scoring (1-10 Scale)
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Formula:</strong> Priority Score = Severity + Urgency
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Severity (Impact)
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">5 - Critical</span>
                    <span className="text-red-600 dark:text-red-400">
                      Production down
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">4 - Major</span>
                    <span className="text-orange-600 dark:text-orange-400">
                      Core feature broken
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">3 - Medium</span>
                    <span className="text-yellow-600 dark:text-yellow-400">
                      Minor disruption
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">2 - Minor</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      Cosmetic issue
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">1 - Trivial</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Style nit
                    </span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Urgency (Time Sensitivity)
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">5 - Immediate</span>
                    <span className="text-red-600 dark:text-red-400">
                      Exploitable now
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">4 - High</span>
                    <span className="text-orange-600 dark:text-orange-400">
                      Next release cycle
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">3 - Medium</span>
                    <span className="text-yellow-600 dark:text-yellow-400">
                      Before major refactor
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">2 - Low</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      Opportunistic
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">1 - Future</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      No immediate risk
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Data Governance
            </h4>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>PII Masking:</strong> All personally identifiable
                  information must be sanitized (e.g., user-1234,
                  [REDACTED_EMAIL])
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>De-Duplication:</strong> Check for existing issues
                  before creating new ones
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Security Principle:</strong> Never report sensitive
                  production data
                </span>
              </li>
            </ul>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Complete Policy Documentation
            </h4>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              For comprehensive details on scanning modes, priority scoring,
              issue templates, and execution guidelines, refer to the full PQA
              Policy document.
            </p>
            <a
              href="/docs/agent-policies/PQA_POLICY.md"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FileText className="w-4 h-4" />
              View Full PQA Policy
            </a>
          </div>
        </div>
      ),
    },
  ];

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;

    const query = searchQuery.toLowerCase();
    return sections.filter(section => {
      const titleMatch = section.title.toLowerCase().includes(query);
      const contentMatch = JSON.stringify(section.content)
        .toLowerCase()
        .includes(query);
      return titleMatch || contentMatch;
    });
  }, [searchQuery, sections]);

  return (
    <div
      className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}
    >
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
                🤖 Autonomous Agent Policy
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Definitive escalation ladder & governance framework
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Search */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search policy..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>

              {/* Expand/Collapse All */}
              <div className="hidden sm:flex gap-2">
                <button
                  onClick={() => toggleAllSections(true)}
                  className="px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  Expand All
                </button>
                <button
                  onClick={() => toggleAllSections(false)}
                  className="px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  Collapse All
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="relative sm:hidden mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search policy..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Table of Contents - Desktop */}
          <aside
            className={`hidden lg:block w-64 flex-shrink-0 ${isMobileMenuOpen ? 'hidden' : ''}`}
          >
            <div className="sticky top-32">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                Quick Navigation
              </h2>
              <nav className="space-y-1">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                  >
                    {section.icon}
                    <span className="truncate">{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Mobile Table of Contents */}
          {isMobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-40 bg-white dark:bg-gray-900 overflow-y-auto pt-20 px-4 pb-8">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                Quick Navigation
              </h2>
              <nav className="space-y-1">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className="w-full text-left px-3 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-3 border border-gray-200 dark:border-gray-700"
                  >
                    {section.icon}
                    <span>{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {filteredSections.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  No results found for &quot;{searchQuery}&quot;
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSections.map(section => {
                  const isExpanded = expandedSections.has(section.id);

                  return (
                    <div
                      key={section.id}
                      id={`section-${section.id}`}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden scroll-mt-24"
                    >
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{section.emoji}</span>
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white text-left">
                            {section.title}
                          </h2>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-6 h-6 text-gray-500 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-gray-500 flex-shrink-0" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="px-6 py-6 border-t border-gray-200 dark:border-gray-700 prose prose-blue dark:prose-invert max-w-none">
                          {section.content}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: white !important;
          }

          * {
            color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .dark ::-webkit-scrollbar-track {
          background: #1f2937;
        }

        ::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        .dark ::-webkit-scrollbar-thumb {
          background: #4b5563;
        }

        .dark ::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }

        /* Touch-friendly tap highlights */
        button {
          -webkit-tap-highlight-color: rgba(59, 130, 246, 0.3);
        }
      `}</style>
    </div>
  );
}
