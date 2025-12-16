import { RuleTester } from "@typescript-eslint/rule-tester";
import * as vitest from "vitest";
import { explicitMemberAccessibility } from "./explicit-member-accessibility.js";

RuleTester.afterAll = vitest.afterAll;
RuleTester.it = vitest.it;
RuleTester.itOnly = vitest.it.only;
RuleTester.describe = vitest.describe;

const ruleTester = new RuleTester();

ruleTester.run("explicit-member-accessibility", explicitMemberAccessibility, {
  valid: [
    // Methods with explicit accessibility
    {
      code: `
        class Test {
          public method() {}
        }
      `,
    },
    {
      code: `
        class Test {
          protected method() {}
        }
      `,
    },
    {
      code: `
        class Test {
          private method() {}
        }
      `,
    },
    // Properties with explicit accessibility
    {
      code: `
        class Test {
          public prop = 1;
        }
      `,
    },
    {
      code: `
        class Test {
          protected prop = 1;
        }
      `,
    },
    {
      code: `
        class Test {
          private prop = 1;
        }
      `,
    },
    // Constructor with explicit accessibility
    {
      code: `
        class Test {
          public constructor() {}
        }
      `,
    },
    // Accessors with explicit accessibility
    {
      code: `
        class Test {
          public get value() { return 1; }
          public set value(v: number) {}
        }
      `,
    },
    // Private identifier fields don't need modifiers
    {
      code: `
        class Test {
          #privateField = 1;
          #privateMethod() {}
        }
      `,
    },
    // Parameter properties with explicit accessibility
    {
      code: `
        class Test {
          public constructor(public name: string) {}
        }
      `,
    },
    {
      code: `
        class Test {
          public constructor(private name: string) {}
        }
      `,
    },
    // Off option
    {
      code: `
        class Test {
          method() {}
        }
      `,
      options: [{ accessibility: "off" }],
    },
  ],
  invalid: [
    // Method without accessibility
    {
      code: `
        class Test {
          method() {}
        }
      `,
      errors: [
        {
          messageId: "missingAccessibility",
          data: {
            memberType: "method",
            memberName: "method",
          },
        },
      ],
    },
    // Property without accessibility
    {
      code: `
        class Test {
          prop = 1;
        }
      `,
      errors: [
        {
          messageId: "missingAccessibility",
          data: {
            memberType: "property",
            memberName: "prop",
          },
        },
      ],
    },
    // Constructor without accessibility
    {
      code: `
        class Test {
          constructor() {}
        }
      `,
      errors: [
        {
          messageId: "missingAccessibility",
          data: {
            memberType: "constructor",
            memberName: "constructor",
          },
        },
      ],
    },
    // Accessor without accessibility
    {
      code: `
        class Test {
          get value() { return 1; }
        }
      `,
      errors: [
        {
          messageId: "missingAccessibility",
          data: {
            memberType: "get accessor",
            memberName: "value",
          },
        },
      ],
    },
    {
      code: `
        class Test {
          set value(v: number) {}
        }
      `,
      errors: [
        {
          messageId: "missingAccessibility",
          data: {
            memberType: "set accessor",
            memberName: "value",
          },
        },
      ],
    },
    // Multiple missing accessibility
    {
      code: `
        class Test {
          prop = 1;
          method() {}
          get accessor() { return 1; }
        }
      `,
      errors: [
        {
          messageId: "missingAccessibility",
          data: {
            memberType: "property",
            memberName: "prop",
          },
        },
        {
          messageId: "missingAccessibility",
          data: {
            memberType: "method",
            memberName: "method",
          },
        },
        {
          messageId: "missingAccessibility",
          data: {
            memberType: "get accessor",
            memberName: "accessor",
          },
        },
      ],
    },
    // no-public mode: error on public keyword
    {
      code: `
        class Test {
          public method() {}
        }
      `,
      options: [{ accessibility: "no-public" }],
      errors: [
        {
          messageId: "unwantedPublicAccessibility",
          data: {
            memberType: "method",
            memberName: "method",
          },
        },
      ],
    },
    // Override: methods explicit but constructors off
    {
      code: `
        class Test {
          constructor() {}
          method() {}
        }
      `,
      options: [
        {
          accessibility: "explicit",
          overrides: {
            constructors: "off",
          },
        },
      ],
      errors: [
        {
          messageId: "missingAccessibility",
          data: {
            memberType: "method",
            memberName: "method",
          },
        },
      ],
    },
    // Abstract method without accessibility
    {
      code: `
        abstract class Test {
          abstract method(): void;
        }
      `,
      errors: [
        {
          messageId: "missingAccessibility",
          data: {
            memberType: "abstract method",
            memberName: "method",
          },
        },
      ],
    },
    // Abstract property without accessibility
    {
      code: `
        abstract class Test {
          abstract prop: number;
        }
      `,
      errors: [
        {
          messageId: "missingAccessibility",
          data: {
            memberType: "abstract property",
            memberName: "prop",
          },
        },
      ],
    },
  ],
});
