import type { TSESLint } from "@typescript-eslint/utils";
import { explicitMemberAccessibility } from "./rules/explicit-member-accessibility.js";
import { memberAccessibilityOrder } from "./rules/member-accessibility-order.js";

const rules = {
  "explicit-member-accessibility": explicitMemberAccessibility,
  "member-accessibility-order": memberAccessibilityOrder,
} as const;

const plugin = {
  meta: {
    name: "eslint-typescript-access",
    version: "1.0.0",
  },
  rules,
  configs: {} as Record<string, TSESLint.FlatConfig.Config>,
};

// Add configs after plugin is defined so we can reference the plugin itself
Object.assign(plugin.configs, {
  recommended: {
    plugins: {
      "typescript-access": plugin,
    },
    rules: {
      "typescript-access/explicit-member-accessibility": "error",
      "typescript-access/member-accessibility-order": "error",
    },
  } satisfies TSESLint.FlatConfig.Config,
  strict: {
    plugins: {
      "typescript-access": plugin,
    },
    rules: {
      "typescript-access/explicit-member-accessibility": [
        "error",
        {
          accessibility: "explicit",
          overrides: {
            constructors: "explicit",
            methods: "explicit",
            properties: "explicit",
            parameterProperties: "explicit",
            accessors: "explicit",
          },
        },
      ],
      "typescript-access/member-accessibility-order": [
        "error",
        {
          order: ["public", "protected", "private"],
          groupByKind: false,
        },
      ],
    },
  } satisfies TSESLint.FlatConfig.Config,
});

export = plugin;
