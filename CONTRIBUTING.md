# Contributing to @aeryflux/xenova-bridge

Thank you for your interest in contributing to the AeryFlux NLP bridge package.
This document provides guidelines for contributing to the project.

## Overview

`@aeryflux/xenova-bridge` is a natural language processing package that provides
intent classification, entity extraction, and action dispatching for AeryFlux
applications. It runs entirely locally using pattern matching with optional
embedding support.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Install dependencies:

```bash
npm install
```

4. Run the test suite to verify your setup:

```bash
npm test
```

## Development

### Project Structure

```
src/
  core/         # IntentEngine, EntityExtractor, ActionDispatcher
  utils/        # Country mappings, pattern definitions, helpers
  index.ts      # Public API exports
```

### Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run the full test suite (vitest) |
| `npm run build` | Build the package (tsup) |
| `npm run dev` | Build in watch mode |
| `npm run typecheck` | Run TypeScript type checking |

### Writing Tests

All new features and bug fixes should include tests. Tests live alongside the
source code and use vitest. Run the test suite before submitting a PR:

```bash
npm test
```

## Pull Request Guidelines

1. Create a feature branch from `main` (e.g., `feat/add-portuguese-support`)
2. Keep changes focused -- one feature or fix per PR
3. Write clear commit messages following the conventional format:
   - `feat(scope): description` for new features
   - `fix(scope): description` for bug fixes
   - `docs: description` for documentation changes
   - `test: description` for test additions
   - `refactor: description` for refactoring
4. Ensure all tests pass (`npm test`)
5. Ensure TypeScript compiles cleanly (`npm run typecheck`)
6. Update documentation if your change affects the public API
7. Open a PR against the `main` branch with a clear description

## Areas of Contribution

- Adding multilingual pattern support for new languages
- Improving entity extraction accuracy (country names, genres, modes)
- Expanding country mappings in `COUNTRY_MAPPINGS`
- Adding new intent categories or action types
- Performance improvements
- Documentation improvements
- Bug fixes

## Code Style

- TypeScript strict mode
- No external runtime dependencies (pattern-based, zero-API design)
- All public APIs must have JSDoc comments and exported types
- English only for code, comments, and documentation

## Reporting Issues

When reporting a bug, please include:

- Input text that produced the unexpected result
- Expected output (intent, entities, or actions)
- Actual output
- Language of the input (EN, FR, ES, DE)

## License

By contributing, you agree that your contributions will be licensed under the
MIT License. See [LICENSE](./LICENSE) for details.
