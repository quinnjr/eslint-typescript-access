# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-12-16

### Added

- Initial release of `@pegasusheavy/eslint-typescript-access`
- `explicit-member-accessibility` rule — Requires explicit `public`, `protected`, or `private` modifiers on all class members
  - Configurable per member type (constructors, methods, properties, parameter properties, accessors)
  - Supports `explicit`, `no-public`, and `off` modes
- `member-accessibility-order` rule — Enforces accessibility ordering in classes
  - Default order: `public` → `protected` → `private`
  - Customizable order via `order` option
  - Optional `groupByKind` mode to check ordering within each member type
- `recommended` preset config with sensible defaults
- `strict` preset config with explicit settings for all member types
- ESLint 9 flat config support
- Full TypeScript support via `@typescript-eslint/utils`

### Developer Experience

- Husky pre-commit hooks with lint-staged
- Husky pre-push hooks running build, test, and lint
- Commitlint for conventional commit message enforcement
- Prettier for consistent code formatting
- Comprehensive test suite using Vitest

[Unreleased]: https://github.com/pegasusheavy/eslint-typescript-access/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/pegasusheavy/eslint-typescript-access/releases/tag/v1.0.0
