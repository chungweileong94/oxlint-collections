import { defineRule, type ESTree } from "@oxlint/plugins";

function returnsJsx(value: ESTree.Node | null): boolean {
  if (!value) {
    return false;
  }
  switch (value.type) {
    case "JSXElement":
    case "JSXFragment":
      return true;
    case "ReturnStatement":
    case "AwaitExpression":
      return returnsJsx(value.argument);
    case "BlockStatement":
      return value.body.some(returnsJsx);
    case "SwitchStatement":
      return value.cases.some(returnsJsx);
    case "SwitchCase":
      return value.consequent.some(returnsJsx);
    case "TryStatement":
      return returnsJsx(value.block) || returnsJsx(value.handler) || returnsJsx(value.finalizer);
    case "CatchClause":
    case "DoWhileStatement":
    case "WhileStatement":
    case "ForStatement":
    case "ForInStatement":
    case "ForOfStatement":
    case "LabeledStatement":
    case "WithStatement":
      return returnsJsx(value.body);
    case "IfStatement":
    case "ConditionalExpression":
      return returnsJsx(value.consequent) || returnsJsx(value.alternate);
    case "LogicalExpression":
      return returnsJsx(value.left) || returnsJsx(value.right);
    case "ArrayExpression":
      return value.elements.some(returnsJsx);
    case "SequenceExpression":
      return returnsJsx(value.expressions.at(-1) ?? null);
    case "TSAsExpression":
    case "TSSatisfiesExpression":
    case "TSNonNullExpression":
    case "TSTypeAssertion":
    case "ParenthesizedExpression":
      return returnsJsx(value.expression);
    default:
      return false;
  }
}

export const noInlineComponentPropsRule = defineRule({
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow inline object types in destructured component props",
    },
    schema: [],
    messages: {
      namedProps:
        "Declare a named props interface above the component instead of using an inline object type on destructured props.",
    },
  },
  create(context) {
    const reported = new Set<number>();

    return {
      TSTypeLiteral(node) {
        if (!context.filename.endsWith(".tsx")) {
          return;
        }

        let component = node.parent;
        while (
          component.type !== "FunctionDeclaration" &&
          component.type !== "FunctionExpression" &&
          component.type !== "ArrowFunctionExpression"
        ) {
          if (component.type === "Program") {
            return;
          }
          component = component.parent;
        }

        const parameter = component.params[0];
        const props = parameter?.type === "AssignmentPattern" ? parameter.left : parameter;
        if (props?.type !== "ObjectPattern" && props?.type !== "ArrayPattern") {
          return;
        }
        const annotation = props.typeAnnotation;
        if (
          !annotation ||
          node.start < annotation.start ||
          node.end > annotation.end ||
          reported.has(annotation.start)
        ) {
          return;
        }

        let expression: typeof node.parent = component;
        let owner = expression.parent;
        let hasReactWrapper = false;
        while (true) {
          if (
            owner.type === "TSAsExpression" ||
            owner.type === "TSSatisfiesExpression" ||
            owner.type === "TSNonNullExpression" ||
            owner.type === "TSTypeAssertion" ||
            owner.type === "ParenthesizedExpression"
          ) {
            expression = owner;
            owner = owner.parent;
            continue;
          }
          if (owner.type === "CallExpression" && isReactWrapper(owner.callee)) {
            if (owner.arguments[0] !== expression) {
              return;
            }
            hasReactWrapper = true;
            expression = owner;
            owner = owner.parent;
            continue;
          }
          break;
        }

        const variableName =
          owner.type === "VariableDeclarator" && owner.id.type === "Identifier"
            ? owner.id.name
            : null;
        if (
          !hasReactWrapper &&
          ![component.id?.name, variableName].some((name) => name && /^[A-Z]/.test(name)) &&
          !(owner.type === "ExportDefaultDeclaration" && returnsJsx(component.body))
        ) {
          return;
        }

        reported.add(annotation.start);
        context.report({ node: annotation, messageId: "namedProps" });

        function isReactWrapper(callee: typeof node.parent): boolean {
          if (callee.type === "Identifier") {
            const imported = reactImportName(callee);
            return imported === "memo" || imported === "forwardRef";
          }
          if (callee.type !== "MemberExpression" || reactImportName(callee.object) !== "*") {
            return false;
          }
          const name =
            !callee.computed && callee.property.type === "Identifier"
              ? callee.property.name
              : callee.property.type === "Literal"
                ? callee.property.value
                : null;
          return name === "memo" || name === "forwardRef";
        }

        function reactImportName(value: typeof node.parent): string | null {
          if (value.type !== "Identifier") {
            return null;
          }
          let scope = context.sourceCode.getScope(value);
          while (true) {
            const binding = scope.set.get(value.name);
            if (binding) {
              const definition = binding.defs[0];
              if (definition?.type !== "ImportBinding") {
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
                return specifier.imported.type === "Identifier"
                  ? specifier.imported.name
                  : specifier.imported.value;
              }
              return "*";
            }
            if (!scope.upper) {
              break;
            }
            scope = scope.upper;
          }
          return value.name === "React" ? "*" : value.name;
        }
      },
    };
  },
});
