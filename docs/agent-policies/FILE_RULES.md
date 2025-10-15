# 📁 File Allowlist/Denylist - Complete Reference

**Purpose:** Definitive file access rules for each execution mode.

**Key Principle:** All files are **READ ALLOWED** (for context), but **WRITE RESTRICTED** unless explicitly in the mode's allowlist.

---

## 🎯 Quick Reference Matrix

| File/Directory | Mode 0 | Mode 0.5 | Mode 1 | Mode 2 | Mode 3 | Read |
|----------------|--------|----------|--------|--------|--------|------|
| `app/**` | ✅ | ✅ | ✅ | ❌ | ✅* | ✅ |
| `src/**` | ✅ | ✅ | ✅ | ❌ | ✅* | ✅ |
| `tests/**` | ✅ | ✅ | ✅ | ❌ | ✅* | ✅ |
| `docs/**` | ✅ | ❌ | ✅ | ❌ | ✅* | ✅ |
| `jest.config.*` | ❌ | ❌ | ✅ | ❌ | ✅* | ✅ |
| `tsconfig*.json` | ❌ | ❌ | ✅ | ❌ | ✅* | ✅ |
| `tests/setup*.ts` | ✅ | ✅ | ✅ | ❌ | ✅* | ✅ |
| `package.json` | ❌ | ❌ | ✅** | ❌ | ✅* | ✅ |
| Lockfiles | ❌ | ❌ | ✅*** | ❌ | ✅* | ✅ |
| `.github/**` | ❌ | ❌ | ❌ | ✅ | ✅* | ✅ |
| Root configs | ❌ | ❌ | ❌ | ❌ | ✅* | ✅ |
| Non-text assets | ❌ | ❌ | ❌ | ❌ | ✅* | ✅ |

**Legend:**
- ✅ = Write allowed
- ❌ = Write denied (read-only)
- ✅* = Write allowed ONLY if explicitly approved in Mode 3 request
- ✅** = Mode 1: Only `scripts` and `devDependencies` sections
- ✅*** = Mode 1: Only if devDependency was added

---

## 📂 Mode 0 (Normal) - Allowlist

### Application Code ✅
```
app/**
src/**
```

**Examples:**
- `app/page.tsx`
- `app/api/route.ts`
- `src/components/Button.tsx`
- `src/lib/utils.ts`
- `src/services/api.ts`

**Rationale:** Core application logic, safe to modify

---

### Test Code ✅
```
tests/**
test/**
__tests__/**
**/*.test.ts
**/*.test.tsx
**/*.spec.ts
**/*.spec.tsx
```

**Examples:**
- `tests/unit/auth.test.ts`
- `src/components/__tests__/Button.test.tsx`
- `app/api/__tests__/route.test.ts`

**Rationale:** Essential for validation, safe to modify

---

### Documentation ✅
```
docs/**
*.md (in allowed directories)
```

**Examples:**
- `docs/api/authentication.md`
- `src/components/README.md`
- `app/README.md`

**Exceptions:**
- Root `README.md` → ❌ Denied (use Mode 3)
- `.github/**/*.md` → ❌ Denied (use Mode 2 or 3)

**Rationale:** Documentation updates are safe and encouraged

---

## 🚫 Mode 0 (Normal) - Denylist

### Root Configuration Files ❌

**ESLint:**
```
eslint.config.js
eslint.config.mjs
eslint.config.cjs
.eslintrc.*
```

**Prettier:**
```
prettier.config.js
prettier.config.mjs
.prettierrc.*
```

**TypeScript:**
```
tsconfig.json
tsconfig.*.json
```

**Bundlers/Build Tools:**
```
next.config.js
next.config.ts
next.config.mjs
vite.config.ts
webpack.config.js
rollup.config.js
```

**Testing:**
```
jest.config.js
jest.config.ts
vitest.config.ts
```

**Git:**
```
.gitignore
.gitattributes
```

**Rationale:** Root configs affect entire project, require Mode 3 approval

**Exception:** May modify if conclusively necessary to fix a core issue (document why)

---

### Dependency Management ❌

```
package.json
package-lock.json
yarn.lock
pnpm-lock.yaml
pnpm-workspace.yaml
```

**Rationale:** Dependency changes have security/stability implications

**Exceptions:**
- Mode 1 (LTRM): `package.json` devDependencies only
- Mode 3: With approval

---

### CI/CD ❌

```
.github/**
.gitlab-ci.yml
.circleci/**
.travis.yml
```

**Rationale:** CI changes affect entire team's workflow

**Exceptions:**
- Mode 2 (CI_REPAIR): `.github/**` only, for repairs
- Mode 3: With approval, for additions

---

### Infrastructure & Deployment ❌

```
Dockerfile*
docker-compose*.yml
.dockerignore
vercel.json
netlify.toml
.vercel/**
```

**Rationale:** Infrastructure changes affect production deployment

**Exception:** Mode 3 with approval

---

### Environment & Secrets ❌

```
.env*
.env.local
.env.production
.env.example
```

**Rationale:** Secrets management is sensitive

**Exception:** Mode 3 with approval (and security review)

---

### Tooling & Hooks ❌

```
husky/**
.husky/**
.vscode/**
.idea/**
scripts/**
```

**Rationale:** Affects local development environment

**Exception:** Mode 3 with approval

---

### Non-Text Assets ❌

**Images:**
```
*.png
*.jpg
*.jpeg
*.gif
*.webp
*.svg (if binary-ish)
*.ico
```

**Fonts:**
```
*.woff
*.woff2
*.ttf
*.otf
*.eot
```

**Other Binaries:**
```
*.pdf
*.zip
*.tar.gz
```

**Rationale:** Non-text assets increase repo size, require license review

**Exception:** Mode 3 with approval (include license/size justification)

---

## 🔧 Mode 0.5 (Refactor) - Allowlist

**Same as Mode 0 EXCEPT:**

### Denied in 0.5 (Even if Allowed in Mode 0) ❌
```
docs/**   (Documentation changes not allowed)
```

**Rationale:** Mode 0.5 is code-only cleanup, no doc changes

---

## 🛠️ Mode 1 (LTRM) - Additional Allowlist

**All Mode 0 files PLUS:**

### Test Configuration ✅
```
jest.config.js
jest.config.ts
jest.config.mjs
vitest.config.ts
```

**Restriction:** Only for fixing broken tests, not feature additions

---

### TypeScript Configuration ✅
```
tsconfig.json
tsconfig.*.json
tsconfig.base.json
```

**Restriction:** Only for fixing type resolution, not feature additions

---

### Test Setup Files ✅
```
tests/setup.ts
tests/setupTests.ts
tests/jest.setup.ts
__tests__/setup.ts
```

**Restriction:** Only for fixing test environment, not feature additions

---

### Package.json (LIMITED) ✅

**Allowed Sections:**
```json
{
  "scripts": {
    "test": "..."    // ✅ Can modify
  },
  "devDependencies": {
    "ts-jest": "..."   // ✅ Can add/modify (ONE only)
  }
}
```

**Denied Sections:**
```json
{
  "dependencies": { ... },     // ❌ Still denied
  "name": "...",              // ❌ Still denied
  "version": "...",           // ❌ Still denied
  "main": "...",              // ❌ Still denied
  "engines": { ... }          // ❌ Still denied
}
```

**Restriction:** ONE devDependency addition allowed (e.g., `ts-jest` or `@swc/jest`)

---

### Lockfiles (CONDITIONAL) ✅

```
package-lock.json
pnpm-lock.yaml
yarn.lock
```

**Condition:** ONLY if a devDependency was added

**Rationale:** Lockfile update is automatic consequence of `npm install <devDep>`

---

## 🔄 Mode 2 (CI_REPAIR) - Allowlist

**ONLY `.github/**` (Highly Restrictive!)**

### Allowed ✅
```
.github/workflows/**
.github/actions/**
.github/CODEOWNERS
.github/ISSUE_TEMPLATE/**
.github/PULL_REQUEST_TEMPLATE.md
```

**Examples:**
- `.github/workflows/test.yml`
- `.github/workflows/deploy.yml`
- `.github/actions/custom-action/action.yml`

### Still Denied ❌

**Even in Mode 2:**
- Application code (`app/**`, `src/**`) → ❌ Denied
- Tests (`tests/**`) → ❌ Denied
- Configs (root `*.config.js`) → ❌ Denied

**Rationale:** Mode 2 is surgical CI repair only, not feature work

---

## 🚨 Mode 3 (Scoped Override) - Allowlist

**ANY file explicitly listed in the APPROVED override request**

### Process

1. Submit Mode 3 Override Request
2. Receive approval with explicit file list:
   ```
   APPROVED_OVERRIDE: Mode 3 (Option 1)
   Approved files:
   - next.config.ts
   - package.json
   - src/lib/imageOptimizer.ts
   ```

3. Save to `PROPOSED_FILES.txt`
4. **Only these files** may be modified

### Pre-Commit Guard (Mandatory)

```bash
# Before committing, verify:
git diff --name-only | while read file; do
  grep -q "^${file}$" PROPOSED_FILES.txt || {
    echo "❌ $file not in approved list!"
    exit 1
  }
done
```

**Rationale:** Prevents scope creep beyond approved paths

---

## 🧊 Mode 4 (Emergency Freeze) - Allowlist

**NO FILE MODIFICATIONS ALLOWED** ❌

**Read-only mode:** Can read any file for analysis, but cannot write.

**Rationale:** High-risk situation, human direction required

---

## 📋 Special Cases & Exceptions

### Generated Files

**Auto-Generated (Always Allowed if source is allowed):**
```
*.map            (Source maps - auto-generated from build)
*.d.ts           (Type declarations - auto-generated from TS)
```

**Exception:** Don't manually modify these, they're build artifacts

---

### Monorepo Package.json

**Workspace Root:**
```
/package.json     → ❌ Denied (Mode 3 required)
```

**Package-Specific:**
```
/packages/app/package.json     → Follow mode rules per package
```

**Rationale:** Root package.json affects all packages

---

### Symbolic Links

**Treatment:** Follow the link target's rules

**Example:**
```
src/lib/utils.ts  → ✅ Allowed (Mode 0)
ln -s src/lib/utils.ts app/utils.ts
app/utils.ts      → ✅ Allowed (symlink to allowed file)
```

---

### Submodules

**Git Submodules:**
```
.gitmodules       → ❌ Denied (Mode 3 required)
<submodule>/**    → ❌ Denied (modify in submodule repo directly)
```

**Rationale:** Submodule changes should be made in their own repos

---

## 🔍 How to Check File Access

### During Planning

```bash
# List all files you plan to modify
FILES=(
  "src/auth/validator.ts"
  "tests/auth/validator.test.ts"
)

# Check each against mode allowlist
for file in "${FILES[@]}"; do
  # Match against patterns in this document
  echo "Checking: $file"
done
```

### Use Decision Tree

See [DECISION_TREES.md > File Modification Decision Tree](./DECISION_TREES.md#file-modification-decision-tree)

### If Uncertain

**Default to Mode 4 (Freeze) and ask:**
```markdown
🧊 EMERGENCY FREEZE (Mode 4)

Issue: #XXX
Trigger: Uncertain file access permissions

**File in Question:** <path>
**Proposed Change:** <description>
**Current Mode:** <N>

**Question:** Is this file allowed in Mode <N>?

**Requesting:** Human confirmation to proceed.
```

---

## 🎯 Common Mistakes & How to Avoid

### Mistake 1: Modifying `package.json` in Mode 0

❌ **Wrong:**
```bash
# In Mode 0
npm install express  # Modifies package.json → VIOLATION
```

✅ **Correct:**
```markdown
→ Submit Mode 3 Override Request
→ Justify: "Need Express for API endpoints"
→ Wait for approval
→ Proceed after APPROVED_OVERRIDE
```

---

### Mistake 2: Changing `tsconfig.json` without LTRM Need

❌ **Wrong:**
```bash
# Baseline tests pass, but want to add path alias
# Edit tsconfig.json → VIOLATION (not LTRM eligible)
```

✅ **Correct:**
```markdown
→ Submit Mode 3 Override Request
→ Justify: "Path aliases improve import clarity"
→ Wait for approval
```

---

### Mistake 3: Adding Image in Mode 0

❌ **Wrong:**
```bash
# In Mode 0
git add public/logo.png  # Non-text asset → VIOLATION
```

✅ **Correct:**
```markdown
→ Submit Mode 3 Override Request
→ Include: File size, license, justification
→ Wait for approval
```

---

### Mistake 4: Modifying Docs in Mode 0.5

❌ **Wrong:**
```bash
# In Mode 0.5 (Refactor)
git add docs/api.md  # Docs not allowed in 0.5 → VIOLATION
```

✅ **Correct:**
```bash
# Use Mode 0 instead (requires issue)
# OR remove doc changes from Mode 0.5 commit
```

---

## 🔗 Related Documentation

- [Mode Reference](./MODE_REFERENCE.md) - Complete mode specifications
- [Decision Trees](./DECISION_TREES.md) - Visual file access flowcharts
- [Workflow Guide](./WORKFLOW_GUIDE.md) - Step-by-step processes
- [Troubleshooting](./TROUBLESHOOTING.md) - File access problems

---

## 📝 Quick Lookup Commands

```bash
# Check if file is in app/src/tests/docs
echo "<file-path>" | grep -E '^(app|src|tests|docs)/'

# Check if file is a root config
echo "<file-path>" | grep -E '(config\.(js|ts|mjs)|\.rc\.|tsconfig)'

# Check if file is a dependency manifest
echo "<file-path>" | grep -E 'package(-lock)?\.json|yarn\.lock|pnpm-lock'

# Check if file is CI-related
echo "<file-path>" | grep -E '\.github/'

# Check if file is binary/asset
file "<file-path>" | grep -v "text"
```

---

**Last Updated:** 2025-10-15  
**Version:** 1.0
