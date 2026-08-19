# eslint-typescript-access

An ESLint plugin that enforces explicit access modifiers and accessibility ordering on TypeScript class members.

## Features

- **Explicit Access Modifiers** — Require `public`, `protected`, or `private` on all class members
- **Accessibility Ordering** — Enforce member ordering by visibility (public → protected → private)
- **Highly Configurable** — Customize rules per member type (methods, properties, constructors, etc.)
- **ESLint 9 Flat Config** — Built for modern ESLint with first-class flat config support

## Installation

```bash
pnpm add -D eslint-typescript-access
```

```bash
npm install -D eslint-typescript-access
```

```bash
yarn add -D eslint-typescript-access
```

## Usage

### Flat Config (ESLint 9+)

```js
// eslint.config.js
import tsAccessPlugin from "eslint-typescript-access";

export default [
  {
    plugins: {
      "typescript-access": tsAccessPlugin,
    },
    rules: {
      "typescript-access/explicit-member-accessibility": "error",
      "typescript-access/member-accessibility-order": "error",
    },
  },
];
```

### Using Presets

The plugin provides two presets:

```js
// eslint.config.js
import tsAccessPlugin from "eslint-typescript-access";

export default [
  // Recommended: enables both rules with sensible defaults
  tsAccessPlugin.configs.recommended,

  // Or Strict: more explicit configuration
  tsAccessPlugin.configs.strict,
];
```

## Rules

### `explicit-member-accessibility`

Requires explicit accessibility modifiers on class properties and methods.

#### Options

```js
{
  // Base accessibility requirement for all members
  // "explicit" - require public/protected/private
  // "no-public" - disallow explicit public (use implicit)
  // "off" - disable the rule
  accessibility: "explicit",

  // Override for specific member types
  overrides: {
    constructors: "explicit",
    methods: "explicit",
    properties: "explicit",
    parameterProperties: "explicit",
    accessors: "explicit",
  }
}
```

#### Examples

```typescript
// ❌ Invalid (missing accessibility)
class Example {
  name: string;
  getName() {
    return this.name;
  }
}

// ✅ Valid
class Example {
  public name: string;
  public getName() {
    return this.name;
  }
}
```

---

### `member-accessibility-order`

Enforces that class members are ordered by accessibility level.

#### Options

```js
{
  // Order of accessibility levels (first = top of class)
  order: ["public", "protected", "private"],

  // If true, ordering is checked within each member kind separately
  // (fields, methods, accessors, etc.)
  groupByKind: false
}
```

#### Examples

```typescript
// ❌ Invalid (private before public)
class Example {
  private secret: string;
  public name: string;
}

// ✅ Valid (public → protected → private)
class Example {
  public name: string;
  protected id: number;
  private secret: string;
}
```

#### Custom Ordering

You can customize the order to match your team's preferences:

```js
// Private first
{
  "typescript-access/member-accessibility-order": [
    "error",
    { order: ["private", "protected", "public"] }
  ]
}
```

#### Group By Kind

With `groupByKind: true`, ordering is checked within each member type separately, allowing you to group fields together, methods together, etc:

```typescript
// ✅ Valid with groupByKind: true
class Example {
  private field1: string;
  public field2: string; // OK - different group than methods below

  private method1() {}
  public method2() {} // Error - within methods, public should come first
}
```

## Preset Configurations

### `recommended`

```js
{
  "typescript-access/explicit-member-accessibility": "error",
  "typescript-access/member-accessibility-order": "error"
}
```

### `strict`

```js
{
  "typescript-access/explicit-member-accessibility": ["error", {
    accessibility: "explicit",
    overrides: {
      constructors: "explicit",
      methods: "explicit",
      properties: "explicit",
      parameterProperties: "explicit",
      accessors: "explicit"
    }
  }],
  "typescript-access/member-accessibility-order": ["error", {
    order: ["public", "protected", "private"],
    groupByKind: false
  }]
}
```

## Why Use This Plugin?

### Explicit is Better Than Implicit

TypeScript defaults class members to `public` when no modifier is specified. This can lead to:

- **Ambiguity** — Is a member public intentionally or by accident?
- **API Surface Creep** — Private implementation details accidentally exposed
- **Code Review Friction** — Reviewers can't tell intent without checking context

By requiring explicit modifiers, your code becomes self-documenting:

```typescript
// Intent is clear
class UserService {
  public getCurrentUser() {} // Part of public API
  protected validateUser() {} // For subclasses
  private cache: Map<string, User>; // Implementation detail
}
```

### Consistent Ordering

Enforcing accessibility order makes classes easier to navigate:

1. **Public API First** — Consumers see the interface immediately
2. **Protected Next** — Subclass authors find extension points
3. **Private Last** — Implementation details at the bottom

## License

MIT © Joseph R. Quinn
