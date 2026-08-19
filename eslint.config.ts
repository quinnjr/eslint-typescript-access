import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import importX from "eslint-plugin-import-x";
import unicorn from "eslint-plugin-unicorn";
import tseslint from "typescript-eslint";
import selfPlugin from "./src/index.js";

export default [
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            "*.config.ts",
            "*.config.js",
            "commitlint.config.ts",
          ],
        },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      "import-x": importX,
      unicorn,
      "typescript-access": selfPlugin,
    },
    rules: {
      // Self-plugin: enforce explicit access modifiers and ordering
      "typescript-access/explicit-member-accessibility": "error",
      "typescript-access/member-accessibility-order": "error",

      // Import rules
      "import-x/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "never",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import-x/no-duplicates": "error",
      "import-x/no-unresolved": "off", // TypeScript handles this

      // Unicorn rules
      "unicorn/prefer-node-protocol": "error",
      "unicorn/no-null": "off",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/no-array-callback-reference": "off",
      "unicorn/no-useless-undefined": "off",

      // TypeScript rules
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        { allowExpressions: true },
      ],
      "@typescript-eslint/no-confusing-void-expression": "off",

      // General rules
      "no-console": "warn",
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
    },
  },
  eslintConfigPrettier,
] satisfies tseslint.ConfigArray;
