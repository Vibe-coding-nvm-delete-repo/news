# Contributing Guidelines

## Setup

1. Clone the repository
2. Run `npm install`
3. Run `npm run prepare` to set up git hooks
4. Create a feature branch: `git checkout -b feature/your-feature`

## Before Committing

All commits automatically run:
- ESLint (with auto-fix)
- Prettier formatting
- TypeScript type checking

To manually validate your changes before committing:
```bash
npm run validate
```

This runs all checks: type-check, lint, format, and tests.

## Pull Request Process

1. Ensure all tests pass: `npm run test:ci`
2. Update documentation if needed
3. Push your branch and create a PR
4. Wait for CI checks to pass
5. Request review from team members

## Code Style

- Use TypeScript strict mode
- Follow Prettier formatting (automatic)
- Use functional components with hooks
- Prefer named exports over default exports
- Add JSDoc comments for complex functions

## Testing Requirements

- Write tests for new features
- Maintain minimum 70% code coverage
- Use React Testing Library best practices
- Mock external dependencies

## Commit Messages

Use conventional commit format:
- `feat: add new feature`
- `fix: resolve bug`
- `docs: update documentation`
- `refactor: restructure code`
- `test: add tests`
- `chore: update dependencies`
