import { defineRule, type Context, type ESTree } from "@oxlint/plugins";

type SourceCode = Context["sourceCode"];

const booleanOperators = new Set([
  "==",
  "===",
  "!=",
  "!==",
  "<",
  "<=",
  ">",
  ">=",
  "in",
  "instanceof",
]);

function unwrap(node: ESTree.Expression) {
  while (node.type === "ParenthesizedExpression") {
    node = node.expression;
  }
  return node;
}

function isJsx(node: ESTree.Expression) {
  const expression = unwrap(node);
  return expression.type === "JSXElement" || expression.type === "JSXFragment";
}

function isEmptyRender(node: ESTree.Expression, sourceCode: SourceCode) {
  const expression = unwrap(node);
  if (expression.type === "Literal") {
    return expression.value === null || expression.value === false;
  }
  if (expression.type !== "Identifier" || expression.name !== "undefined") {
    return false;
  }
  let scope = sourceCode.getScope(expression);
  while (true) {
    const binding = scope.set.get("undefined");
    if (binding) {
      return binding.defs.length === 0;
    }
    if (!scope.upper) {
      return true;
    }
    scope = scope.upper;
  }
}

function isBoolean(node: ESTree.Expression) {
  const expression = unwrap(node);
  return (
    (expression.type === "Literal" && typeof expression.value === "boolean") ||
    (expression.type === "UnaryExpression" && expression.operator === "!") ||
    (expression.type === "BinaryExpression" && booleanOperators.has(expression.operator))
  );
}

function unaryOperand(node: ESTree.Expression, sourceCode: SourceCode) {
  const text = sourceCode.getText(node);
  return node.type === "Identifier" ||
    node.type === "MemberExpression" ||
    node.type === "CallExpression" ||
    node.type === "ChainExpression" ||
    node.type === "ThisExpression" ||
    node.type === "ParenthesizedExpression"
    ? text
    : `(${text})`;
}

function isJsxChild(node: ESTree.ConditionalExpression) {
  let parent: ESTree.Node | null = node.parent;
  while (parent?.type === "ParenthesizedExpression") {
    parent = parent.parent;
  }
  return (
    parent?.type === "JSXExpressionContainer" &&
    (parent.parent.type === "JSXElement" || parent.parent.type === "JSXFragment")
  );
}

export const preferJsxShortCircuitRule = defineRule({
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer short-circuit rendering when one JSX ternary branch renders nothing",
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      preferShortCircuit: "Prefer short-circuit rendering when one ternary branch renders nothing.",
      replaceWithShortCircuit: "Replace the ternary with short-circuit rendering.",
    },
  },
  createOnce(context) {
    return {
      ConditionalExpression(node) {
        if (!isJsxChild(node)) {
          return;
        }

        const { sourceCode } = context;
        const jsxWhenTruthy = isJsx(node.consequent) && isEmptyRender(node.alternate, sourceCode);
        const jsxWhenFalsy = isEmptyRender(node.consequent, sourceCode) && isJsx(node.alternate);
        if (!jsxWhenTruthy && !jsxWhenFalsy) {
          return;
        }

        const renderedNode = jsxWhenTruthy ? node.consequent : node.alternate;
        const operand = unaryOperand(node.test, sourceCode);
        const condition = jsxWhenTruthy
          ? isBoolean(node.test)
            ? sourceCode.getText(node.test)
            : `!!${operand}`
          : `!${operand}`;
        const losesComments = sourceCode
          .getCommentsInside(node)
          .some(
            (comment) =>
              ![node.test, renderedNode].some(
                (retained) => comment.start >= retained.start && comment.end <= retained.end,
              ),
          );

        context.report({
          node,
          messageId: "preferShortCircuit",
          suggest: losesComments
            ? []
            : [
                {
                  messageId: "replaceWithShortCircuit",
                  fix(fixer) {
                    return fixer.replaceText(
                      node,
                      `${condition} && ${sourceCode.getText(renderedNode)}`,
                    );
                  },
                },
              ],
        });
      },
    };
  },
});
