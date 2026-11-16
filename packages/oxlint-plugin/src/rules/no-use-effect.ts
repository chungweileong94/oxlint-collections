import { defineRule, type Context, type ESTree } from "@oxlint/plugins";

function unwrap(node: ESTree.Expression): ESTree.Expression {
  while (
    node.type === "ParenthesizedExpression" ||
    node.type === "TSAsExpression" ||
    node.type === "TSSatisfiesExpression" ||
    node.type === "TSNonNullExpression" ||
    node.type === "TSTypeAssertion" ||
    node.type === "ChainExpression"
  ) {
    node = node.expression;
  }
  return node;
}

function reactImportName(node: ESTree.Expression, context: Context): string | null {
  const value = unwrap(node);
  if (value.type !== "Identifier") {
    return null;
  }

  let scope = context.sourceCode.getScope(value);
  while (true) {
    const binding = scope.set.get(value.name);
    if (binding && binding.defs.length > 0) {
      const definition = binding.defs[0];
      if (definition.type !== "ImportBinding") {
        return null;
      }
      const specifier = definition.node;
      const declaration = specifier.parent;
      if (
        declaration?.type !== "ImportDeclaration" ||
        declaration.source.value !== "react" ||
        declaration.importKind === "type"
      ) {
        return null;
      }
      if (specifier.type === "ImportSpecifier") {
        if (specifier.importKind === "type") {
          return null;
        }
        const name =
          specifier.imported.type === "Identifier"
            ? specifier.imported.name
            : specifier.imported.value;
        return name === "default" ? "*" : name;
      }
      return "*";
    }
    if (!scope.upper) {
      return value.name === "React" ? "*" : value.name;
    }
    scope = scope.upper;
  }
}

export const noUseEffectRule = defineRule({
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow direct React useEffect calls",
    },
    schema: [],
    messages: {
      noUseEffect:
        "Avoid useEffect. Derive values during render, handle user actions in event handlers, or use a purpose-specific data or subscription hook. For necessary external synchronization, add a narrow lint exception with a reason.",
    },
  },
  createOnce(context) {
    return {
      CallExpression(node) {
        const callee = unwrap(node.callee);
        if (callee.type === "Identifier") {
          if (reactImportName(callee, context) !== "useEffect") {
            return;
          }
        } else if (callee.type === "MemberExpression") {
          const name =
            !callee.computed && callee.property.type === "Identifier"
              ? callee.property.name
              : callee.property.type === "Literal"
                ? callee.property.value
                : null;
          if (name !== "useEffect" || reactImportName(callee.object, context) !== "*") {
            return;
          }
        } else {
          return;
        }

        context.report({ node: callee, messageId: "noUseEffect" });
      },
    };
  },
});
