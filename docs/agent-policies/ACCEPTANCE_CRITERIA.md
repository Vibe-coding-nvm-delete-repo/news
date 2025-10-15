# ✅ Acceptance Criteria Catalog - Complete Quality Standards

**Purpose:** Comprehensive reference of all quality gates that PRs must satisfy before merge.

---

## 📑 Criteria Categories

1. [Code Quality](#code-quality)
2. [Testing](#testing)
3. [Build & Deployment](#build--deployment)
4. [Performance](#performance)
5. [Security](#security)
6. [Internationalization (i18n)](#internationalization-i18n)
7. [Accessibility](#accessibility)
8. [Documentation](#documentation)
9. [Policy Compliance](#policy-compliance)

---

## 🎨 Code Quality

### ✅ AC-001: Linter (Zero Warnings)

**Requirement:**
```bash
npm run lint -- --max-warnings=0
```

**Must Return:** Exit code 0, zero warnings, zero errors

**Rationale:** Enforce consistent code style and catch potential bugs

**Exceptions:** None (strict enforcement)

**Fix Workflow:**
```bash
# Auto-fix what's possible
npm run lint -- --fix

# Manually fix remaining issues
# Common issues:
# - Unused variables → Remove or prefix with _
# - Console.log → Remove debug code
# - Missing dependencies in useEffect → Add to deps array
```

---

### ✅ AC-002: TypeScript (Zero Type Errors)

**Requirement:**
```bash
npx tsc --noEmit
```

**Must Return:** Exit code 0, zero type errors

**Rationale:** Type safety prevents runtime errors and improves code quality

**Exceptions:** None (strict enforcement)

**Common Failures:**
- Missing type annotations
- Incorrect type usage
- Unresolved imports

**Fix Workflow:**
```typescript
// ❌ Bad
const data = fetchData();  // Implicit 'any'

// ✅ Good
const data: UserData = fetchData();

// ❌ Bad
const value = obj.unknownProp;  // Property doesn't exist

// ✅ Good
const value = (obj as ExtendedType).knownProp;
```

---

### ✅ AC-003: No Debug Code

**Requirement:** Zero console.log, debugger statements in final commit

**Check:**
```bash
git diff main | grep -E '(console\.log|debugger)' && echo "❌ FAIL" || echo "✅ PASS"
```

**Must Return:** ✅ PASS (no matches)

**Rationale:** Debug code shouldn't reach production

**Exceptions:**
- Intentional logging (use `logger.info()` instead)
- Error handling (use `logger.error()` with context)

---

### ✅ AC-004: No Commented Code

**Requirement:** Zero commented-out code blocks in final diff

**Check:**
```bash
git diff main | grep -E '^\+.*\/\/' | grep -v '^\+.*\/\/ ' && echo "❌ FAIL" || echo "✅ PASS"
```

**Rationale:** Commented code creates clutter and confusion

**Exceptions:**
- Intentional comments explaining logic
- TODO/FIXME with issue numbers

**Fix Workflow:**
```typescript
// ❌ Bad
// const oldImplementation = () => { ... };  // Remove this

// ✅ Good
// TODO(#456): Refactor this to use new API
const currentImplementation = () => { ... };
```

---

## 🧪 Testing

### ✅ AC-101: Unit Test Added/Modified

**Requirement:** ≥1 unit test added or adjusted to cover the fix/feature

**Rationale:** Prevent regressions, ensure behavior is validated

**Exceptions:** None (every code change requires test coverage)

**Test Quality Criteria:**
```typescript
describe('validateEmail', () => {
  // ✅ Good: Specific, descriptive test
  it('should reject emails with regex special characters', () => {
    expect(validateEmail('admin@[localhost]')).toBe(false);
  });

  // ✅ Good: Tests edge case
  it('should handle empty string input', () => {
    expect(validateEmail('')).toBe(false);
  });

  // ❌ Bad: Vague test
  it('should work', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });
});
```

---

### ✅ AC-102: Full Test Suite Passes

**Requirement:**
```bash
npm test -- --runInBand
```

**Must Return:** Exit code 0, all tests pass, zero failures

**Rationale:** Ensure no regressions in existing functionality

**Failure Response:**
- If test fails due to your change → Fix the code
- If test was already broken → Document in Mode 1 (LTRM) or Mode 4 (Freeze)

---

### ✅ AC-103: Test Coverage Maintained/Improved

**Requirement:** Overall test coverage should not decrease

**Check (if coverage tool configured):**
```bash
npm test -- --coverage
# Compare coverage % to baseline
```

**Rationale:** Prevent technical debt accumulation

**Exceptions:**
- Small decreases (<1%) acceptable for refactors
- Large new files may temporarily decrease % (add tests soon)

---

### ✅ AC-104: No Skipped Tests

**Requirement:** Zero `.skip` or `xit` in committed code

**Check:**
```bash
git diff main | grep -E '(\.skip|xit)\(' && echo "❌ FAIL" || echo "✅ PASS"
```

**Rationale:** Skipped tests hide problems

**Exceptions:**
- Temporarily skip with issue number: `it.skip('... (TODO #456)', ...)`
- Must have plan to unskip

---

## 🏗️ Build & Deployment

### ✅ AC-201: Production Build Succeeds

**Requirement:**
```bash
npm run build
```

**Must Return:** Exit code 0, successful build

**Rationale:** Ensure code can be deployed to production

**Common Failures:**
- Import errors (missing files)
- Environment variable issues
- Build config problems

---

### ✅ AC-202: No Build Warnings

**Requirement:** Build output contains zero warnings

**Check:** Review build output for warnings

**Rationale:** Warnings often indicate real problems

**Exceptions:**
- Known third-party library warnings (document)
- Deprecation warnings with migration plan

---

### ✅ AC-203: Bundle Size Check

**Requirement:** Bundle size increase ≤10% without justification

**Check:**
```bash
# Compare bundle sizes
npm run build
ls -lh .next/**/*.js | awk '{print $5, $9}'
```

**Rationale:** Prevent performance regressions

**Exceptions:**
- Large dependency addition (must be justified in Mode 3 request)
- New feature with significant UI (document expected increase)

---

## ⚡ Performance

### ✅ AC-301: No Significant Performance Regression

**Requirement:** No changes introduce:
- Increased memory usage (>20%)
- Blocking UI threads
- Significant latency increase (>100ms)

**Check Methods:**
- Lighthouse audit (before/after)
- Manual testing with large datasets
- Profile with browser DevTools

**Rationale:** Maintain user experience quality

**Documentation Required:**
```markdown
## Performance Impact

**Before:**
- Page load: 1.2s
- Memory usage: 45MB
- Lighthouse score: 92/100

**After:**
- Page load: 1.25s (+4%)
- Memory usage: 47MB (+4%)
- Lighthouse score: 91/100 (-1)

**Justification:** Acceptable for new feature functionality
```

---

### ✅ AC-302: No Inefficient Algorithms

**Requirement:** Time complexity should be appropriate for data size

**Common Issues:**
```typescript
// ❌ Bad: O(n²) when O(n) is possible
items.forEach(item => {
  const match = items.find(i => i.id === item.id);  // Nested loop!
});

// ✅ Good: O(n) with Map
const itemMap = new Map(items.map(i => [i.id, i]));
items.forEach(item => {
  const match = itemMap.get(item.id);
});
```

---

### ✅ AC-303: Proper React Optimization

**Requirement:** Use memoization/callbacks appropriately

**Check:**
```typescript
// ❌ Bad: Creates new function every render
<Button onClick={() => handleClick(id)} />

// ✅ Good: Memoized callback
const onClick = useCallback(() => handleClick(id), [id]);
<Button onClick={onClick} />

// ❌ Bad: Expensive computation every render
const filtered = items.filter(item => item.active);

// ✅ Good: Memoized computation
const filtered = useMemo(() => items.filter(item => item.active), [items]);
```

---

## 🔒 Security

### ✅ AC-401: No Hardcoded Secrets

**Requirement:** Zero hardcoded passwords, API keys, tokens in source code

**Check:**
```bash
git diff main | grep -iE '(password|api[_-]?key|token|secret).*=.*["\'][a-zA-Z0-9]'
```

**Rationale:** Secrets in code = security breach

**Correct Approach:**
```typescript
// ❌ Bad
const API_KEY = "sk-1234567890abcdef";

// ✅ Good
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
if (!API_KEY) {
  throw new Error("NEXT_PUBLIC_API_KEY not configured");
}
```

---

### ✅ AC-402: Input Validation & Sanitization

**Requirement:** All user input must be validated/sanitized before use

**Check:**
```typescript
// ❌ Bad: Direct use of user input in query
const query = `SELECT * FROM users WHERE name = '${req.query.name}'`;

// ✅ Good: Parameterized query
const query = db.prepare('SELECT * FROM users WHERE name = ?');
const result = query.get(req.query.name);

// ❌ Bad: Direct use in HTML (XSS risk)
element.innerHTML = userInput;

// ✅ Good: Sanitize or use textContent
element.textContent = userInput;
// OR use DOMPurify for rich content
element.innerHTML = DOMPurify.sanitize(userInput);
```

---

### ✅ AC-403: Dependency Security

**Requirement:** New dependencies must have:
- 0 known CVEs (critical/high)
- Active maintenance (last publish <6 months)
- Permissive license (MIT, Apache, BSD)

**Check:**
```bash
npm audit --package=<package-name>
npm view <package-name> license
npm view <package-name> time
```

**Required for:** Mode 3 Override requests

---

### ✅ AC-404: No Sensitive Data in Logs

**Requirement:** Logs must not contain PII, passwords, tokens

**Check:**
```typescript
// ❌ Bad
logger.info('User login:', { email, password });

// ✅ Good
logger.info('User login:', { userId: user.id });

// ❌ Bad
console.error('Auth failed:', token);

// ✅ Good
console.error('Auth failed:', { reason: 'invalid_token' });
```

---

## 🌍 Internationalization (i18n)

### ✅ AC-501: No Hardcoded User-Facing Strings

**Requirement:** All user-facing text must use i18n system

**Check:**
```bash
# Find hardcoded strings in JSX/TSX
git diff main -- '*.tsx' '*.jsx' | grep -E '>\s*[A-Z][a-z]+.*<'
```

**Implementation:**
```typescript
// ❌ Bad: Hardcoded string
<button>Save Changes</button>

// ✅ Good: i18n key
<button>{t('actions.save_changes')}</button>

// ❌ Bad: Hardcoded error message
throw new Error('Invalid email address');

// ✅ Good: i18n error
throw new Error(t('errors.invalid_email'));
```

---

### ✅ AC-502: i18n Keys Added to Locale Files

**Requirement:** If new i18n keys are used, they must be added to all locale files

**Files to Update:**
```
locales/en.json
locales/es.json
locales/fr.json
... (all supported locales)
```

**Example:**
```json
// locales/en.json
{
  "actions": {
    "save_changes": "Save Changes"
  }
}

// locales/es.json
{
  "actions": {
    "save_changes": "Guardar Cambios"
  }
}
```

---

## ♿ Accessibility

### ✅ AC-601: Semantic HTML

**Requirement:** Use semantic HTML elements appropriately

**Examples:**
```tsx
// ❌ Bad: Non-semantic
<div onClick={handleClick}>Click me</div>

// ✅ Good: Semantic
<button onClick={handleClick}>Click me</button>

// ❌ Bad: Missing heading hierarchy
<h1>Page Title</h1>
<h3>Section</h3>  // Skipped h2

// ✅ Good: Proper hierarchy
<h1>Page Title</h1>
<h2>Section</h2>
```

---

### ✅ AC-602: ARIA Labels for Interactive Elements

**Requirement:** Interactive elements must have accessible labels

**Examples:**
```tsx
// ❌ Bad: Icon button without label
<button><CloseIcon /></button>

// ✅ Good: ARIA label
<button aria-label="Close dialog"><CloseIcon /></button>

// ❌ Bad: Form input without label
<input type="email" />

// ✅ Good: Associated label
<label htmlFor="email">Email</label>
<input id="email" type="email" />
```

---

### ✅ AC-603: Keyboard Navigation

**Requirement:** All interactive elements accessible via keyboard

**Check:**
- Tab through interface
- Ensure focus visible
- Ensure Enter/Space activate buttons
- Ensure Escape closes modals

---

## 📚 Documentation

### ✅ AC-701: Code Comments for Complex Logic

**Requirement:** Non-obvious code must have explanatory comments

**Examples:**
```typescript
// ✅ Good: Explains WHY
// Use binary search because array is pre-sorted by timestamp
const index = binarySearch(items, target);

// ❌ Bad: Explains WHAT (obvious from code)
// Increment counter
counter++;

// ✅ Good: Explains edge case
// Handle null user (can occur during SSR)
if (!user) return <LoginPrompt />;
```

---

### ✅ AC-702: Public API Documentation

**Requirement:** Exported functions/components must have JSDoc

**Example:**
```typescript
/**
 * Validates an email address format
 * @param email - Email address to validate
 * @returns true if valid, false otherwise
 * @throws {ValidationError} if email contains SQL injection attempt
 * @example
 * validateEmail('user@example.com') // true
 * validateEmail('invalid') // false
 */
export function validateEmail(email: string): boolean {
  // ...
}
```

---

### ✅ AC-703: README Updates (If Applicable)

**Requirement:** If public API changes, update README.md

**Triggers:**
- New exported functions/classes
- Changed function signatures
- New environment variables
- New npm scripts

---

## 📋 Policy Compliance

### ✅ AC-801: Mode Compliance

**Requirement:** All modified files must be within current mode's allowlist

**Check:**
```bash
git diff main --name-only > changed-files.txt
# Compare against mode allowlist (see FILE_RULES.md)
```

---

### ✅ AC-802: Diff Budget

**Requirement:** Changes must be within mode's diff budget

| Mode | Max Lines | Max Files |
|------|-----------|-----------|
| 0 | 300 | 4 |
| 0.5 | 50 | 2 |
| 1 | 120 | 2 |
| 2 | Minimal | 1-2 |
| 3 | Per approval | Per approval |

**Check:**
```bash
git diff main --stat | tail -1
# Example output: "4 files changed, 285 insertions(+), 12 deletions(-)"
# Net: 285 + 12 = 297 lines ✅ (within 300 budget for Mode 0)
```

---

### ✅ AC-803: Commit Message Format

**Requirement:** Commit must follow template

**Required Elements:**
- Type prefix (`fix:`, `feat:`, `refactor:`)
- Short description
- Issue reference (`Fixes #XXX`)
- `Mode: <N>`
- `RCA:` section (3-5 lines)
- `Tests:` section

**Example:**
```
fix: email validation bypass (Fixes #123)

Mode: 0
RCA: Regex was not escaping special chars, allowing bypass.
Validator used raw input in RegExp constructor, enabling XSS.
Minimal fix: Added escapeRegex() helper to sanitize input.
Tests: tests/auth/validator.test.ts
```

---

### ✅ AC-804: Branch Naming

**Requirement:** Branch must follow naming convention

**Format:** `ai/<issue>-<description>-<timestamp>`

**Examples:**
- ✅ `ai/123-fix-login-bug-202510151430`
- ✅ `ai/refactor-date-utils-202510151445` (Mode 0.5, no issue number)
- ❌ `fix-login` (missing prefix, issue, timestamp)

---

### ✅ AC-805: PR Title

**Requirement:** PR title must start with `/ai` and include issue reference

**Format:** `/ai <type>: <description> (Fixes #<issue>)`

**Examples:**
- ✅ `/ai fix: email validation bypass (Fixes #123)`
- ✅ `/ai feat: add dark mode toggle (Fixes #234)`
- ✅ `/ai refactor: remove unused utilities` (Mode 0.5, no issue)
- ❌ `Fix email validation` (missing /ai prefix and issue)

---

## 🎯 Complete Acceptance Checklist

**Before opening PR, verify ALL:**

### Automated Checks
- [ ] `npm run lint -- --max-warnings=0` ✅ PASS
- [ ] `npx tsc --noEmit` ✅ PASS
- [ ] `npm test -- --runInBand` ✅ PASS
- [ ] `npm run build` ✅ PASS

### Code Quality
- [ ] No `console.log` or `debugger` statements
- [ ] No commented-out code
- [ ] No TODOs without issue numbers

### Testing
- [ ] ≥1 unit test added/modified
- [ ] Test coverage maintained/improved
- [ ] No skipped tests (`.skip`, `xit`)

### Performance
- [ ] No significant performance regression
- [ ] Efficient algorithms used
- [ ] React optimizations applied (if applicable)

### Security
- [ ] No hardcoded secrets
- [ ] Input validation/sanitization present
- [ ] No sensitive data in logs

### i18n
- [ ] No hardcoded user-facing strings
- [ ] i18n keys added to all locale files

### Documentation
- [ ] Complex logic has comments
- [ ] Public APIs have JSDoc
- [ ] README updated (if applicable)

### Policy
- [ ] All files within mode allowlist
- [ ] Diff within mode budget
- [ ] Commit message follows template
- [ ] Branch naming correct
- [ ] PR title has `/ai` prefix

---

## 📚 Related Documentation

- [Verification Checklist](./VERIFICATION_CHECKLIST.md) - Final audit process
- [Mode Reference](./MODE_REFERENCE.md) - File allowlist rules
- [Workflow Guide](./WORKFLOW_GUIDE.md) - Step-by-step processes

---

**Last Updated:** 2025-10-15  
**Version:** 1.0
