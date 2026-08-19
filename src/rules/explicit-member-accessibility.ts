import { ESLintUtils, AST_NODE_TYPES } from "@typescript-eslint/utils";
import type { TSESTree } from "@typescript-eslint/utils";

type AccessibilityLevel = "explicit" | "no-public" | "off";

type Options = [
  {
    accessibility?: AccessibilityLevel;
    overrides?: {
      constructors?: AccessibilityLevel;
      methods?: AccessibilityLevel;
      properties?: AccessibilityLevel;
      parameterProperties?: AccessibilityLevel;
      accessors?: AccessibilityLevel;
    };
  },
];

type MessageIds = "missingAccessibility" | "unwantedPublicAccessibility";

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/quinnjr/eslint-typescript-access/blob/main/docs/rules/${name}.md`
);

type NodeWithKey =
  | TSESTree.MethodDefinition
  | TSESTree.PropertyDefinition
  | TSESTree.TSAbstractMethodDefinition
  | TSESTree.TSAbstractPropertyDefinition
  | TSESTree.AccessorProperty
  | TSESTree.TSAbstractAccessorProperty;

function getMemberName(
  node: NodeWithKey | TSESTree.TSParameterProperty
): string {
  if (node.type === AST_NODE_TYPES.TSParameterProperty) {
    return node.parameter.type === AST_NODE_TYPES.Identifier
      ? node.parameter.name
      : "parameter property";
  }

  switch (node.key.type) {
    case AST_NODE_TYPES.Identifier:
      return node.key.name;
    case AST_NODE_TYPES.Literal:
      return String(node.key.value);
    case AST_NODE_TYPES.PrivateIdentifier:
      return `#${node.key.name}`;
    default:
      return "computed property";
  }
}

export const explicitMemberAccessibility = createRule<Options, MessageIds>({
  name: "explicit-member-accessibility",
  meta: {
    type: "problem",
    docs: {
      description:
        "Require explicit accessibility modifiers on class properties and methods",
    },
    messages: {
      missingAccessibility:
        "Missing accessibility modifier on {{memberType}} '{{memberName}}'. Expected explicit 'public', 'protected', or 'private'.",
      unwantedPublicAccessibility:
        "Public accessibility modifier on {{memberType}} '{{memberName}}' is unwanted.",
    },
    schema: [
      {
        type: "object",
        properties: {
          accessibility: {
            type: "string",
            enum: ["explicit", "no-public", "off"],
          },
          overrides: {
            type: "object",
            properties: {
              constructors: {
                type: "string",
                enum: ["explicit", "no-public", "off"],
              },
              methods: {
                type: "string",
                enum: ["explicit", "no-public", "off"],
              },
              properties: {
                type: "string",
                enum: ["explicit", "no-public", "off"],
              },
              parameterProperties: {
                type: "string",
                enum: ["explicit", "no-public", "off"],
              },
              accessors: {
                type: "string",
                enum: ["explicit", "no-public", "off"],
              },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      accessibility: "explicit",
    },
  ],
  create(context, [options]) {
    const baseAccessibility = options.accessibility ?? "explicit";
    const overrides = options.overrides ?? {};

    function getAccessibilityLevel(
      memberType: keyof NonNullable<Options[0]["overrides"]>
    ): AccessibilityLevel {
      return overrides[memberType] ?? baseAccessibility;
    }

    function checkAccessibility(
      node: NodeWithKey | TSESTree.TSParameterProperty,
      memberType: keyof NonNullable<Options[0]["overrides"]>,
      memberTypeName: string
    ): void {
      const accessibilityLevel = getAccessibilityLevel(memberType);

      if (accessibilityLevel === "off") {
        return;
      }

      // Private identifiers (e.g., #privateField) don't need accessibility modifiers
      if (
        node.type !== AST_NODE_TYPES.TSParameterProperty &&
        node.key.type === AST_NODE_TYPES.PrivateIdentifier
      ) {
        return;
      }

      const { accessibility } = node;
      const memberName = getMemberName(node);

      switch (accessibilityLevel) {
        case "explicit":
          if (!accessibility) {
            context.report({
              node,
              messageId: "missingAccessibility",
              data: {
                memberType: memberTypeName,
                memberName,
              },
            });
          }
          break;
        case "no-public":
          if (accessibility === "public") {
            context.report({
              node,
              messageId: "unwantedPublicAccessibility",
              data: {
                memberType: memberTypeName,
                memberName,
              },
            });
          }
          break;
      }
    }

    return {
      MethodDefinition(node): void {
        if (node.kind === "constructor") {
          checkAccessibility(node, "constructors", "constructor");
        } else if (node.kind === "get" || node.kind === "set") {
          checkAccessibility(node, "accessors", `${node.kind} accessor`);
        } else {
          checkAccessibility(node, "methods", "method");
        }
      },
      TSAbstractMethodDefinition(node): void {
        if (node.kind === "get" || node.kind === "set") {
          checkAccessibility(
            node,
            "accessors",
            `abstract ${node.kind} accessor`
          );
        } else {
          checkAccessibility(node, "methods", "abstract method");
        }
      },
      PropertyDefinition(node): void {
        checkAccessibility(node, "properties", "property");
      },
      TSAbstractPropertyDefinition(node): void {
        checkAccessibility(node, "properties", "abstract property");
      },
      AccessorProperty(node): void {
        checkAccessibility(node, "accessors", "accessor property");
      },
      TSAbstractAccessorProperty(node): void {
        checkAccessibility(node, "accessors", "abstract accessor property");
      },
      TSParameterProperty(node): void {
        checkAccessibility(node, "parameterProperties", "parameter property");
      },
    };
  },
});

export default explicitMemberAccessibility;
