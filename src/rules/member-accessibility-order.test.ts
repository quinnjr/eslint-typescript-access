import { RuleTester } from "@typescript-eslint/rule-tester";
import * as vitest from "vitest";
import { memberAccessibilityOrder } from "./member-accessibility-order.js";

RuleTester.afterAll = vitest.afterAll;
RuleTester.it = vitest.it;
RuleTester.itOnly = vitest.it.only;
RuleTester.describe = vitest.describe;

const ruleTester = new RuleTester();

ruleTester.run("member-accessibility-order", memberAccessibilityOrder, {
  valid: [
    // Correct order: public → protected → private
    {
      code: `
        class Test {
          public a = 1;
          public b() {}
          protected c = 2;
          protected d() {}
          private e = 3;
          private f() {}
        }
      `,
    },
    // All public
    {
      code: `
        class Test {
          public a = 1;
          public b = 2;
          public c() {}
        }
      `,
    },
    // All private
    {
      code: `
        class Test {
          private a = 1;
          private b = 2;
          private c() {}
        }
      `,
    },
    // Mixed methods and fields in correct order
    {
      code: `
        class Test {
          public field = 1;
          public method() {}
          protected field2 = 2;
          private field3 = 3;
        }
      `,
    },
    // With constructor
    {
      code: `
        class Test {
          public field = 1;
          public constructor() {}
          protected method() {}
          private other() {}
        }
      `,
    },
    // With accessors
    {
      code: `
        class Test {
          public get value() { return 1; }
          public set value(v: number) {}
          protected get other() { return 2; }
          private get secret() { return 3; }
        }
      `,
    },
    // Static members
    {
      code: `
        class Test {
          public static a = 1;
          protected static b = 2;
          private static c = 3;
        }
      `,
    },
    // Implicit public (no modifier) treated as public
    {
      code: `
        class Test {
          a = 1;
          method() {}
          protected b = 2;
          private c = 3;
        }
      `,
    },
    // Empty class
    {
      code: `
        class Test {}
      `,
    },
    // Private identifiers are skipped (order is checked among non-private-identifier members)
    {
      code: `
        class Test {
          public a = 1;
          #privateField = 2;
          private b = 3;
        }
      `,
    },
    // groupByKind: true - allows mixed order across different kinds
    {
      code: `
        class Test {
          private field = 1;
          public method() {}
        }
      `,
      options: [{ groupByKind: true }],
    },
    // Custom order: private → protected → public
    {
      code: `
        class Test {
          private a = 1;
          protected b = 2;
          public c = 3;
        }
      `,
      options: [{ order: ["private", "protected", "public"] }],
    },
    // Abstract members
    {
      code: `
        abstract class Test {
          public abstract a(): void;
          protected abstract b(): void;
          private c = 1;
        }
      `,
    },
  ],
  invalid: [
    // Private before public
    {
      code: `
        class Test {
          private a = 1;
          public b = 2;
        }
      `,
      errors: [
        {
          messageId: "incorrectOrder",
          data: {
            currentName: "b",
            currentAccessibility: "public",
            previousName: "a",
            previousAccessibility: "private",
            expectedOrder: "public → protected → private",
          },
        },
      ],
    },
    // Protected before public
    {
      code: `
        class Test {
          protected a = 1;
          public b = 2;
        }
      `,
      errors: [
        {
          messageId: "incorrectOrder",
          data: {
            currentName: "b",
            currentAccessibility: "public",
            previousName: "a",
            previousAccessibility: "protected",
            expectedOrder: "public → protected → private",
          },
        },
      ],
    },
    // Private before protected
    {
      code: `
        class Test {
          private a = 1;
          protected b = 2;
        }
      `,
      errors: [
        {
          messageId: "incorrectOrder",
          data: {
            currentName: "b",
            currentAccessibility: "protected",
            previousName: "a",
            previousAccessibility: "private",
            expectedOrder: "public → protected → private",
          },
        },
      ],
    },
    // Multiple violations
    {
      code: `
        class Test {
          private a = 1;
          protected b = 2;
          public c = 3;
        }
      `,
      errors: [
        {
          messageId: "incorrectOrder",
          data: {
            currentName: "b",
            currentAccessibility: "protected",
            previousName: "a",
            previousAccessibility: "private",
            expectedOrder: "public → protected → private",
          },
        },
        {
          messageId: "incorrectOrder",
          data: {
            currentName: "c",
            currentAccessibility: "public",
            previousName: "b",
            previousAccessibility: "protected",
            expectedOrder: "public → protected → private",
          },
        },
      ],
    },
    // Methods out of order
    {
      code: `
        class Test {
          private method() {}
          public other() {}
        }
      `,
      errors: [
        {
          messageId: "incorrectOrder",
          data: {
            currentName: "other",
            currentAccessibility: "public",
            previousName: "method",
            previousAccessibility: "private",
            expectedOrder: "public → protected → private",
          },
        },
      ],
    },
    // Accessors out of order
    {
      code: `
        class Test {
          private get a() { return 1; }
          public get b() { return 2; }
        }
      `,
      errors: [
        {
          messageId: "incorrectOrder",
          data: {
            currentName: "b",
            currentAccessibility: "public",
            previousName: "a",
            previousAccessibility: "private",
            expectedOrder: "public → protected → private",
          },
        },
      ],
    },
    // Static members out of order
    {
      code: `
        class Test {
          private static a = 1;
          public static b = 2;
        }
      `,
      errors: [
        {
          messageId: "incorrectOrder",
          data: {
            currentName: "b",
            currentAccessibility: "public",
            previousName: "a",
            previousAccessibility: "private",
            expectedOrder: "public → protected → private",
          },
        },
      ],
    },
    // Implicit public after private
    {
      code: `
        class Test {
          private a = 1;
          b = 2;
        }
      `,
      errors: [
        {
          messageId: "incorrectOrder",
          data: {
            currentName: "b",
            currentAccessibility: "public",
            previousName: "a",
            previousAccessibility: "private",
            expectedOrder: "public → protected → private",
          },
        },
      ],
    },
    // Custom order violated: private → protected → public
    {
      code: `
        class Test {
          public a = 1;
          private b = 2;
        }
      `,
      options: [{ order: ["private", "protected", "public"] }],
      errors: [
        {
          messageId: "incorrectOrder",
          data: {
            currentName: "b",
            currentAccessibility: "private",
            previousName: "a",
            previousAccessibility: "public",
            expectedOrder: "private → protected → public",
          },
        },
      ],
    },
    // groupByKind: true - error within same kind
    {
      code: `
        class Test {
          private field = 1;
          public field2 = 2;
        }
      `,
      options: [{ groupByKind: true }],
      errors: [
        {
          messageId: "incorrectOrder",
          data: {
            currentName: "field2",
            currentAccessibility: "public",
            previousName: "field",
            previousAccessibility: "private",
            expectedOrder: "public → protected → private",
          },
        },
      ],
    },
    // Abstract members out of order
    {
      code: `
        abstract class Test {
          protected abstract a(): void;
          public abstract b(): void;
        }
      `,
      errors: [
        {
          messageId: "incorrectOrder",
          data: {
            currentName: "b",
            currentAccessibility: "public",
            previousName: "a",
            previousAccessibility: "protected",
            expectedOrder: "public → protected → private",
          },
        },
      ],
    },
  ],
});
