import { ESLintUtils, AST_NODE_TYPES } from "@typescript-eslint/utils";
import type { TSESTree } from "@typescript-eslint/utils";

type Accessibility = "public" | "protected" | "private";

type MemberKind =
  | "field"
  | "constructor"
  | "method"
  | "get"
  | "set"
  | "static-field"
  | "static-method"
  | "static-get"
  | "static-set";

type Options = [
  {
    order?: Accessibility[];
    groupByKind?: boolean;
  },
];

type MessageIds = "incorrectOrder";

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/quinnjr/eslint-typescript-access/blob/main/docs/rules/${name}.md`
);

const DEFAULT_ORDER: Accessibility[] = ["public", "protected", "private"];

interface MemberInfo {
  node: TSESTree.Node;
  accessibility: Accessibility;
  kind: MemberKind;
  name: string;
  isStatic: boolean;
}

function getAccessibility(
  node:
    | TSESTree.MethodDefinition
    | TSESTree.PropertyDefinition
    | TSESTree.TSAbstractMethodDefinition
    | TSESTree.TSAbstractPropertyDefinition
    | TSESTree.AccessorProperty
    | TSESTree.TSAbstractAccessorProperty
): Accessibility {
  // Default to public if no accessibility modifier
  return node.accessibility ?? "public";
}

function getMemberKind(
  node:
    | TSESTree.MethodDefinition
    | TSESTree.PropertyDefinition
    | TSESTree.TSAbstractMethodDefinition
    | TSESTree.TSAbstractPropertyDefinition
    | TSESTree.AccessorProperty
    | TSESTree.TSAbstractAccessorProperty
): MemberKind {
  const isStatic = "static" in node && node.static;

  switch (node.type) {
    case AST_NODE_TYPES.PropertyDefinition:
    case AST_NODE_TYPES.TSAbstractPropertyDefinition:
    case AST_NODE_TYPES.AccessorProperty:
    case AST_NODE_TYPES.TSAbstractAccessorProperty:
      return isStatic ? "static-field" : "field";

    case AST_NODE_TYPES.MethodDefinition:
    case AST_NODE_TYPES.TSAbstractMethodDefinition:
      if (node.kind === "constructor") {
        return "constructor";
      }
      if (node.kind === "get") {
        return isStatic ? "static-get" : "get";
      }
      if (node.kind === "set") {
        return isStatic ? "static-set" : "set";
      }
      return isStatic ? "static-method" : "method";
  }
}

function getMemberName(
  node:
    | TSESTree.MethodDefinition
    | TSESTree.PropertyDefinition
    | TSESTree.TSAbstractMethodDefinition
    | TSESTree.TSAbstractPropertyDefinition
    | TSESTree.AccessorProperty
    | TSESTree.TSAbstractAccessorProperty
): string {
  if (node.key.type === AST_NODE_TYPES.Identifier) {
    return node.key.name;
  }
  if (node.key.type === AST_NODE_TYPES.Literal) {
    return String(node.key.value);
  }
  if (node.key.type === AST_NODE_TYPES.PrivateIdentifier) {
    return `#${node.key.name}`;
  }
  return "[computed]";
}

export const memberAccessibilityOrder = createRule<Options, MessageIds>({
  name: "member-accessibility-order",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforce that class members are ordered by accessibility (public → protected → private)",
    },
    messages: {
      incorrectOrder:
        "Member '{{currentName}}' ({{currentAccessibility}}) should come before '{{previousName}}' ({{previousAccessibility}}). Expected order: {{expectedOrder}}.",
    },
    schema: [
      {
        type: "object",
        properties: {
          order: {
            type: "array",
            items: {
              type: "string",
              enum: ["public", "protected", "private"],
            },
            minItems: 3,
            maxItems: 3,
            uniqueItems: true,
          },
          groupByKind: {
            type: "boolean",
            description:
              "If true, ordering is checked within each member kind group (fields, methods, etc.)",
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      order: DEFAULT_ORDER,
      groupByKind: false,
    },
  ],
  create(context, [options]) {
    const order = options.order ?? DEFAULT_ORDER;
    const groupByKind = options.groupByKind ?? false;

    function getAccessibilityRank(accessibility: Accessibility): number {
      const index = order.indexOf(accessibility);
      return index === -1 ? order.length : index;
    }

    function checkMemberOrder(members: MemberInfo[]): void {
      if (groupByKind) {
        // Group members by kind and check each group
        const groups = new Map<MemberKind, MemberInfo[]>();
        for (const member of members) {
          const existing = groups.get(member.kind) ?? [];
          existing.push(member);
          groups.set(member.kind, existing);
        }
        for (const groupMembers of groups.values()) {
          checkGroupOrder(groupMembers);
        }
      } else {
        checkGroupOrder(members);
      }
    }

    function checkGroupOrder(members: MemberInfo[]): void {
      for (let i = 1; i < members.length; i++) {
        const current = members[i];
        const previous = members[i - 1];

        const currentRank = getAccessibilityRank(current.accessibility);
        const previousRank = getAccessibilityRank(previous.accessibility);

        if (currentRank < previousRank) {
          context.report({
            node: current.node,
            messageId: "incorrectOrder",
            data: {
              currentName: current.name,
              currentAccessibility: current.accessibility,
              previousName: previous.name,
              previousAccessibility: previous.accessibility,
              expectedOrder: order.join(" → "),
            },
          });
        }
      }
    }

    return {
      ClassBody(node): void {
        const members: MemberInfo[] = [];

        for (const member of node.body) {
          // Skip non-member nodes like static blocks
          if (
            member.type !== AST_NODE_TYPES.MethodDefinition &&
            member.type !== AST_NODE_TYPES.PropertyDefinition &&
            member.type !== AST_NODE_TYPES.TSAbstractMethodDefinition &&
            member.type !== AST_NODE_TYPES.TSAbstractPropertyDefinition &&
            member.type !== AST_NODE_TYPES.AccessorProperty &&
            member.type !== AST_NODE_TYPES.TSAbstractAccessorProperty
          ) {
            continue;
          }

          // Skip private identifiers (they have their own implicit accessibility)
          if (member.key.type === AST_NODE_TYPES.PrivateIdentifier) {
            continue;
          }

          members.push({
            node: member,
            accessibility: getAccessibility(member),
            kind: getMemberKind(member),
            name: getMemberName(member),
            isStatic: "static" in member && member.static,
          });
        }

        checkMemberOrder(members);
      },
    };
  },
});

export default memberAccessibilityOrder;
