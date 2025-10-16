# Code Style Guide

## Overview

This document defines the coding standards and best practices for the News Report Generator project. Following these guidelines ensures consistency, maintainability, and quality across the codebase.

## General Principles

### 1. Write Self-Documenting Code

```typescript
// ❌ Bad: Unclear variable names
const x = data.filter(d => d.e);

// ✅ Good: Clear, descriptive names
const enabledKeywords = keywords.filter(keyword => keyword.enabled);
```

### 2. Keep Functions Small and Focused

```typescript
// ❌ Bad: Function does too much
function processEverything() {
  validateData();
  fetchFromAPI();
  parseResults();
  updateUI();
  saveToStorage();
}

// ✅ Good: Single responsibility
function validateApiKey(key: string): boolean {
  return isValidOpenRouterApiKey(key);
}
```

### 3. Prefer Composition Over Inheritance

```typescript
// ✅ Good: Compose smaller components
export function NewsTab() {
  return (
    <div>
      <ActiveCardsTab />
      <ArchivedCardsTab />
      <HistoryTab />
    </div>
  );
}
```

## TypeScript Standards

### Type Definitions

#### Always Define Types

```typescript
// ❌ Bad: Implicit any
function processData(data) {
  return data.map(item => item.value);
}

// ✅ Good: Explicit types
function processData(data: DataItem[]): number[] {
  return data.map(item => item.value);
}
```

#### Use Interfaces for Objects

```typescript
// ✅ Good: Clear interface
interface NewsCard {
  id: string;
  title: string;
  summary: string;
  rating: number;
}
```

#### Use Type for Unions/Intersections

```typescript
// ✅ Good: Use type for unions
type TabName = 'settings' | 'news' | 'history';
type Status = 'pending' | 'loading' | 'complete' | 'error';
```

#### Avoid `any`

```typescript
// ❌ Bad: Using any
function parse(text: any): any {
  return JSON.parse(text);
}

// ✅ Good: Proper typing
function parse<T>(text: string): T {
  return JSON.parse(text) as T;
}

// ✅ Better: With validation
function parseJSON(text: string): unknown {
  return JSON.parse(text);
}
```

### Null Safety

```typescript
// ✅ Good: Handle null/undefined explicitly
interface Settings {
  apiKey: string | null;
  selectedModel: string | null;
}

// ✅ Good: Use optional chaining
const modelName = settings.selectedModel?.name ?? 'No model selected';

// ✅ Good: Use nullish coalescing
const apiKey = settings.apiKey ?? '';
```

## React/Next.js Standards

### Component Structure

```typescript
/**
 * Component documentation in JSDoc format.
 *
 * @component
 */
'use client'; // If client component

import { useState } from 'react';
import type { ComponentProps } from './types';

// 1. Type definitions
interface MyComponentProps {
  title: string;
  onSubmit: (data: FormData) => void;
}

// 2. Component definition
export default function MyComponent({ title, onSubmit }: MyComponentProps) {
  // 3. Hooks
  const [isOpen, setIsOpen] = useState(false);

  // 4. Event handlers
  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  // 5. Render logic
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={handleClick}>Toggle</button>
    </div>
  );
}
```

### Naming Conventions

```typescript
// ✅ Components: PascalCase
export default function NewsCard() {}

// ✅ Hooks: camelCase with 'use' prefix
const useApiKey = () => {};

// ✅ Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;
const API_BASE_URL = 'https://api.example.com';

// ✅ Variables/Functions: camelCase
const isValidKey = true;
function validateApiKey() {}

// ✅ Interfaces: PascalCase
interface UserSettings {}

// ✅ Types: PascalCase
type Status = 'active' | 'inactive';
```

### Hooks Best Practices

```typescript
// ✅ Good: Declare all hooks at the top
function MyComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { settings } = useStore();

  // ❌ Bad: Conditional hooks
  // if (condition) {
  //   const value = useState(0); // Never do this!
  // }

  // ✅ Good: Use hooks unconditionally
  const value = useState(0);
  const shouldUseValue = condition;
}
```

### Component Exports

```typescript
// ✅ Good: Default export for main component
export default function NewsCard() {}

// ✅ Good: Named export for utilities
export function formatDate(date: string): string {}
export function calculateCost(tokens: number): number {}

// ✅ Good: Named export for types
export type { NewsCardProps, Status };
```

## State Management (Zustand)

### Store Structure

```typescript
// ✅ Good: Organized store
interface StoreState {
  // State grouped by domain
  settings: Settings;
  models: Model[];
  cards: Card[];

  // Actions grouped by domain
  setApiKey: (key: string) => void;
  setSelectedModel: (model: string) => void;
  addCard: (card: Card) => void;
}

// ✅ Good: Immutable updates
setApiKey: key =>
  set(state => ({
    settings: { ...state.settings, apiKey: key },
  }));
```

### Action Naming

```typescript
// ✅ Good: Clear action names
interface Actions {
  setApiKey: (key: string) => void; // set[Property]
  addKeyword: (keyword: Keyword) => void; // add[Item]
  removeKeyword: (id: string) => void; // remove[Item]
  toggleKeyword: (id: string) => void; // toggle[Property]
  resetSettings: () => void; // reset[Section]
}
```

## Styling Standards

### Tailwind Classes

```typescript
// ✅ Good: Logical order (layout → spacing → colors → effects)
<div className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md">

// ✅ Good: Use cn() for conditional classes
<div className={cn(
  "px-4 py-2 rounded",
  isActive && "bg-blue-500 text-white",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>

// ❌ Bad: Mixing styles
<div className="bg-blue-500" style={{ padding: '8px' }}>
```

### Component Classes

```typescript
// ✅ Good: Extract repeated classes to constants
const buttonBaseClasses = 'px-4 py-2 rounded font-medium transition-colors';
const buttonPrimaryClasses = cn(buttonBaseClasses, 'bg-blue-500 text-white');

// ✅ Good: Use class-variance-authority for variants
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  'px-4 py-2 rounded font-medium', // base
  {
    variants: {
      variant: {
        primary: 'bg-blue-500 text-white',
        secondary: 'bg-gray-200 text-gray-900',
      },
      size: {
        sm: 'text-sm',
        lg: 'text-lg',
      },
    },
  }
);
```

## Error Handling

### Try-Catch Blocks

```typescript
// ✅ Good: Specific error handling
try {
  const data = await fetchData();
  return processData(data);
} catch (error) {
  if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
    return fallbackData;
  }
  if (error instanceof ValidationError) {
    console.error('Validation error:', error.message);
    throw error;
  }
  console.error('Unexpected error:', error);
  throw new Error('Failed to fetch data');
}
```

### Error Messages

```typescript
// ❌ Bad: Generic error messages
throw new Error('Error occurred');

// ✅ Good: Specific, actionable error messages
throw new Error('Invalid API key format. Expected: sk-or-v1-[64 hex chars]');

// ✅ Good: Include context
throw new Error(
  `Failed to parse JSON response. Response preview: "${text.slice(0, 100)}..."`
);
```

## Documentation Standards

### JSDoc Comments

````typescript
/**
 * Validates an OpenRouter API key format.
 *
 * OpenRouter keys follow the pattern: `sk-or-v1-` followed by 64 hexadecimal characters.
 *
 * @param key - The API key string to validate
 * @returns `true` if valid, `false` otherwise
 *
 * @example
 * ```ts
 * isValidOpenRouterApiKey('sk-or-v1-abc...') // true
 * isValidOpenRouterApiKey('invalid')         // false
 * ```
 */
export function isValidOpenRouterApiKey(key: string): boolean {
  if (!key) return false;
  return /^sk-or-v1-[a-f0-9]{64}$/i.test(key.trim());
}
````

### Inline Comments

```typescript
// ✅ Good: Explain WHY, not WHAT
// Use :online suffix to enable web search capabilities
const onlineModel = `${modelId}:online`;

// ❌ Bad: Comment states the obvious
// Set loading to true
setLoading(true);

// ✅ Good: Comment explains complex logic
// Strategy 3: Extract JSON from surrounding text
// This handles cases where AI adds explanatory text before/after JSON
const jsonMatch = text.match(/\{[\s\S]*\}/);
```

### TODO Comments

```typescript
// ✅ Good: Actionable TODOs with context
// TODO: Add pagination when card count exceeds 100
// TODO: Implement virtual scrolling for better performance

// ❌ Bad: Vague TODOs
// TODO: Fix this
// TODO: Make better
```

## Testing Standards

### Test Structure

```typescript
describe('ComponentName', () => {
  // ✅ Good: Group related tests
  describe('when user is logged in', () => {
    it('displays user profile', () => {
      // Arrange
      const user = { name: 'John' };

      // Act
      render(<Profile user={user} />);

      // Assert
      expect(screen.getByText('John')).toBeInTheDocument();
    });
  });
});
```

### Test Naming

```typescript
// ✅ Good: Descriptive test names
it('shows error message when API key is invalid', () => {});
it('disables submit button while loading', () => {});
it('filters cards by selected date range', () => {});

// ❌ Bad: Vague test names
it('works correctly', () => {});
it('test 1', () => {});
```

### Test Coverage

```typescript
// ✅ Good: Test all code paths
describe('parseJSON', () => {
  it('parses clean JSON', () => {});
  it('strips markdown code blocks', () => {});
  it('extracts JSON from text', () => {});
  it('throws error for invalid JSON', () => {});
});
```

## File Organization

### Import Order

```typescript
// 1. React/Next.js
import { useState } from 'react';
import dynamic from 'next/dynamic';

// 2. External libraries
import { create } from 'zustand';
import { Loader2 } from 'lucide-react';

// 3. Internal imports (absolute paths with @/)
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// 4. Types
import type { NewsCard, Settings } from '@/lib/store';

// 5. Relative imports (if needed)
import { LocalHelper } from './helpers';
```

### File Naming

```
// ✅ Components: PascalCase.tsx
NewsCard.tsx
SettingsTab.tsx

// ✅ Utilities: camelCase.ts
utils.ts
store.ts

// ✅ Tests: same name + .test
NewsCard.test.tsx
utils.test.ts

// ✅ Types: PascalCase.ts or types.ts
UserTypes.ts
types.ts
```

## Performance Best Practices

### Avoid Unnecessary Re-renders

```typescript
// ✅ Good: Use memo for expensive components
const ExpensiveComponent = memo(({ data }) => {
  return <div>{/* Complex rendering */}</div>;
});

// ✅ Good: Use useMemo for expensive calculations
const sortedCards = useMemo(() => {
  return cards.sort((a, b) => b.rating - a.rating);
}, [cards]);

// ✅ Good: Use useCallback for stable function references
const handleSubmit = useCallback(() => {
  submitForm(data);
}, [data]);
```

### Lazy Loading

```typescript
// ✅ Good: Lazy load heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Loader />,
  ssr: false,
});
```

## Security Best Practices

### Input Validation

```typescript
// ✅ Good: Always validate user input
function validateApiKey(key: string): boolean {
  if (!key || typeof key !== 'string') return false;
  return /^sk-or-v1-[a-f0-9]{64}$/i.test(key.trim());
}

// ✅ Good: Sanitize before use
function sanitizeInput(input: string): string {
  return input.trim().slice(0, MAX_LENGTH);
}
```

### API Keys

```typescript
// ❌ Bad: Never hardcode API keys
const API_KEY = 'sk-or-v1-abc123...';

// ✅ Good: Use environment variables or user input
const apiKey = process.env.NEXT_PUBLIC_API_KEY || settings.apiKey;
```

## Git Commit Messages

### Format

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
# ✅ Good commits
feat(news): add parallel keyword search processing
fix(settings): validate API key format before save
docs(api): add OpenRouter integration documentation
refactor(store): simplify state update logic
test(utils): add tests for parseJSON function

# ❌ Bad commits
update stuff
fixed bug
changes
wip
```

## Code Review Checklist

Before submitting code for review:

- [ ] TypeScript types are defined (no `any`)
- [ ] JSDoc comments added for public functions
- [ ] Tests written and passing
- [ ] No console.logs (except intentional logging)
- [ ] Error handling implemented
- [ ] Components are reasonably sized (<300 lines)
- [ ] No hardcoded values (use constants)
- [ ] Accessibility attributes added (aria-labels, etc.)
- [ ] Performance optimizations applied where needed
- [ ] Code follows project style guidelines

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [React Best Practices](https://react.dev/learn)
- [Tailwind CSS Best Practices](https://tailwindcss.com/docs/reusing-styles)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles)

## Questions?

If you're unsure about a style decision:

1. Check existing code in the project
2. Refer to this guide
3. Ask in code review
4. Follow TypeScript/React best practices

**Remember:** Consistency is more important than perfection. When in doubt, follow existing patterns in the codebase.
