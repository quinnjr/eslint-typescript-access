# Contributing to @pegasusheavy/eslint-typescript-access

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Commit Messages](#commit-messages)
- [Pull Requests](#pull-requests)
- [Adding a New Rule](#adding-a-new-rule)

## Code of Conduct

Please be respectful and constructive in all interactions. We're all here to build something useful together.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 10+

### Setup

1. Fork the repository
2. Clone your fork:

   ```bash
   git clone https://github.com/YOUR_USERNAME/eslint-typescript-access.git
   cd eslint-typescript-access
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Verify setup:

   ```bash
   pnpm run build
   pnpm run test
   pnpm run lint
   ```

## Development Workflow

### Available Scripts

| Script              | Description                      |
| ------------------- | -------------------------------- |
| `pnpm build`        | Compile TypeScript to `dist/`    |
| `pnpm test`         | Run tests with Vitest            |
| `pnpm test:watch`   | Run tests in watch mode          |
| `pnpm lint`         | Run ESLint                       |
| `pnpm lint:fix`     | Run ESLint with auto-fix         |
| `pnpm format`       | Format code with Prettier        |
| `pnpm format:check` | Check formatting without changes |

### Development Loop

1. Make your changes in `src/`
2. Write or update tests in `*.test.ts` files
3. Run tests: `pnpm test`
4. Run lint: `pnpm lint`
5. Build: `pnpm build`

### Project Structure

```
src/
├── index.ts                              # Plugin entry point
└── rules/
    ├── explicit-member-accessibility.ts      # Rule implementation
    ├── explicit-member-accessibility.test.ts # Rule tests
    ├── member-accessibility-order.ts         # Rule implementation
    └── member-accessibility-order.test.ts    # Rule tests
```

## Code Style

This project uses ESLint and Prettier to enforce consistent code style.

### Key Guidelines

- **Explicit access modifiers** — All class members must have `public`, `protected`, or `private`
- **Accessibility ordering** — Class members ordered: public → protected → private
- **Type imports** — Use `import type` for type-only imports
- **Explicit return types** — Functions must have explicit return types

These rules are enforced by the plugin itself (dogfooding!).

### Auto-formatting

The project uses Husky to run lint-staged on pre-commit:

- TypeScript/JavaScript files are linted and formatted
- JSON/Markdown files are formatted

## Commit Messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Commit messages are validated by commitlint.

### Format

```
type(scope): description

[optional body]

[optional footer]
```

### Types

| Type       | Description                                             |
| ---------- | ------------------------------------------------------- |
| `feat`     | New feature                                             |
| `fix`      | Bug fix                                                 |
| `docs`     | Documentation only changes                              |
| `style`    | Code style changes (formatting, semicolons, etc)        |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf`     | Performance improvement                                 |
| `test`     | Adding or updating tests                                |
| `build`    | Changes to build system or dependencies                 |
| `ci`       | Changes to CI configuration                             |
| `chore`    | Other changes that don't modify src or test             |
| `revert`   | Reverts a previous commit                               |

### Examples

```bash
feat(rules): add support for accessor properties
fix(explicit-member-accessibility): handle abstract methods correctly
docs: update README with new configuration options
test: add edge case tests for private identifiers
```

## Pull Requests

### Before Submitting

1. **Create an issue first** for significant changes
2. **Branch from `main`**: `git checkout -b feat/your-feature`
3. **Write tests** for new functionality
4. **Update documentation** if needed
5. **Run all checks**:
   ```bash
   pnpm run build
   pnpm run test
   pnpm run lint
   ```

### PR Guidelines

- Keep PRs focused on a single change
- Write a clear description of what and why
- Reference related issues with `Fixes #123` or `Closes #123`
- Ensure CI passes before requesting review

### Review Process

1. A maintainer will review your PR
2. Address any feedback
3. Once approved, a maintainer will merge

## Adding a New Rule

### 1. Create the Rule File

Create `src/rules/your-rule-name.ts`:

```typescript
import { ESLintUtils } from "@typescript-eslint/utils";

type Options = [
  {
    // your options here
  },
];

type MessageIds = "yourMessageId";

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/pegasusheavy/eslint-typescript-access/blob/main/docs/rules/${name}.md`
);

export const yourRuleName = createRule<Options, MessageIds>({
  name: "your-rule-name",
  meta: {
    type: "problem", // or "suggestion"
    docs: {
      description: "Description of what the rule does",
    },
    messages: {
      yourMessageId: "Error message shown to users",
    },
    schema: [
      // JSON Schema for options
    ],
  },
  defaultOptions: [{}],
  create(context, [options]) {
    return {
      // AST visitor methods
    };
  },
});

export default yourRuleName;
```

### 2. Create Tests

Create `src/rules/your-rule-name.test.ts`:

```typescript
import { RuleTester } from "@typescript-eslint/rule-tester";
import * as vitest from "vitest";
import { yourRuleName } from "./your-rule-name.js";

RuleTester.afterAll = vitest.afterAll;
RuleTester.it = vitest.it;
RuleTester.itOnly = vitest.it.only;
RuleTester.describe = vitest.describe;

const ruleTester = new RuleTester();

ruleTester.run("your-rule-name", yourRuleName, {
  valid: [
    // Valid test cases
  ],
  invalid: [
    // Invalid test cases with expected errors
  ],
});
```

### 3. Export from Index

Update `src/index.ts`:

```typescript
import { yourRuleName } from "./rules/your-rule-name.js";

const rules = {
  // existing rules...
  "your-rule-name": yourRuleName,
} as const;
```

### 4. Add to Configs (Optional)

If the rule should be in presets, add to the configs in `src/index.ts`.

### 5. Document

- Update `README.md` with rule documentation
- Add entry to `CHANGELOG.md` under `[Unreleased]`

## Questions?

If you have questions, feel free to open an issue for discussion.

---

Thank you for contributing! 🚀
