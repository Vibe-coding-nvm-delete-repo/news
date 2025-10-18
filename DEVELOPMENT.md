# Development Guide

## Quick Start

```bash
# Install dependencies
npm install

# Initialize git hooks
npm run prepare

# Start development server
npm run dev
```

## Available Scripts

| Command                | Description                                       |
| ---------------------- | ------------------------------------------------- |
| `npm run dev`          | Start development server on http://localhost:3000 |
| `npm run build`        | Build production bundle                           |
| `npm run start`        | Start production server                           |
| `npm run lint`         | Run ESLint                                        |
| `npm run format:check` | Check code formatting with Prettier               |
| `npm run type-check`   | Run TypeScript compiler checks                    |
| `npm test`             | Run tests (all tests run sequentially)            |
| `npm run test:ci`      | Run tests with coverage for CI                    |
| `npm run prepare`      | Install Husky git hooks (runs automatically)      |

## Code Quality Tools

### ESLint

- Enforces code consistency and catches bugs
- Configuration: `.eslintrc.json`
- Rules include TypeScript best practices and Next.js optimizations

### Prettier

- Auto-formats code for consistent style
- Configuration: `.prettierrc`
- Runs on save and pre-commit

### TypeScript

- Strict mode enabled for maximum type safety
- Configuration: `tsconfig.json`
- Path aliases: `@/*` maps to project root

### Husky + lint-staged

- Automatically runs linting and formatting on commit
- Only processes staged files for speed
- Prevents bad code from entering the repository

## Testing

### Jest + React Testing Library

- Configuration: `jest.config.js`
- Setup: `jest.setup.js`
- All tests run sequentially with `--runInBand` flag
- Tests include component, integration, and unit tests

### Writing Tests

```typescript
// __tests__/Component.test.tsx
import { render, screen } from '@testing-library/react';
import Component from '@/components/Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## CI/CD Pipeline

### GitHub Actions Workflow

Located: `.github/workflows/ci.yml`

#### Jobs:

1. **Lint & Type Check**: Runs ESLint, Prettier, and TypeScript checks
2. **Test**: Runs Jest with coverage reporting
3. **Build**: Validates production build succeeds

#### Triggers:

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

### Pre-commit Checks

Automatically run on `git commit`:

- ESLint fixes
- Prettier formatting
- Only on staged files

## Project Structure

```
.
├── app/              # Next.js app directory
├── components/       # React components
├── lib/              # Utility functions
├── public/           # Static assets
├── __tests__/        # Test files
└── types/            # TypeScript type definitions
```

## Best Practices

### Code Quality

- Write TypeScript, avoid `any` types
- Use functional components with hooks
- Keep components small and focused
- Write tests for critical functionality

### Performance

- Use Next.js Image component for images
- Implement code splitting with dynamic imports
- Optimize bundle size (check with `npm run build`)
- Use React Server Components when possible

### Git Workflow

1. Create feature branch from `develop`
2. Make changes and commit (pre-commit hooks run automatically)
3. Push and create PR
4. CI pipeline validates code
5. Merge after approval and passing checks

## Debugging

### Development

- Use React DevTools browser extension
- Check Next.js build output for optimization hints
- Monitor bundle size in build output

### Common Issues

**Husky hooks not running?**

```bash
npm run prepare
chmod +x .husky/pre-commit
```

**Type errors after installing packages?**

```bash
npm run type-check
```

**Tests failing?**

```bash
npm test -- --clearCache
npm test
```

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Testing Library](https://testing-library.com/react)
- [ESLint Rules](https://eslint.org/docs/rules/)
