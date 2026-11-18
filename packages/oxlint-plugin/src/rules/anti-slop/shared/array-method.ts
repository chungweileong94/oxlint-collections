import type { ESTree, SourceCode, Variable } from "@oxlint/plugins";
import { resolveVariable } from "./scope.ts";

const arrayReturningMethods = new Set([
  "map",
  "filter",
  "flatMap",
  "slice",
  "concat",
  "toSorted",
  "toReversed",
  "toSpliced",
]);

/** Unwrap syntax-only wrappers when inspecting array methods and accumulator references. */
export function unwrapArrayExpression(node: ESTree.Expression): ESTree.Expression {
  while (
    node.type === "ParenthesizedExpression" ||
    node.type === "ChainExpression" ||
    node.type === "TSAsExpression" ||
    node.type === "TSTypeAssertion" ||
    node.type === "TSNonNullExpression" ||
    node.type === "TSSatisfiesExpression"
  ) {
    node = node.expression;
  }
  return node;
}

/** Read static method names, including computed string literals, without evaluating expressions. */
export function arrayMethodTarget(
  node: ESTree.Expression,
): { readonly name: string; readonly object: ESTree.Expression } | null {
  node = unwrapArrayExpression(node);
  if (node.type !== "MemberExpression") return null;
  const property = node.property;
  if (!node.computed && property.type === "Identifier") {
    return { name: property.name, object: node.object };
  }
  if (node.computed && property.type === "Literal" && typeof property.value === "string") {
    return { name: property.value, object: node.object };
  }
  return null;
}

function isArrayAnnotation(type: ESTree.TSType): boolean {
  if (type.type === "TSArrayType" || type.type === "TSTupleType") return true;
  if (type.type === "TSParenthesizedType") return isArrayAnnotation(type.typeAnnotation);
  if (type.type === "TSTypeOperator" && type.operator === "readonly") {
    return isArrayAnnotation(type.typeAnnotation);
  }
  return (
    type.type === "TSTypeReference" &&
    type.typeName.type === "Identifier" &&
    (type.typeName.name === "Array" || type.typeName.name === "ReadonlyArray")
  );
}

/** Recognize local array evidence; unknown receivers and iterator pipelines are deliberately excluded. */
export function isKnownArrayExpression(
  sourceCode: SourceCode,
  node: ESTree.Expression,
  knownBindings: WeakMap<Variable, boolean>,
): boolean {
  node = unwrapArrayExpression(node);
  if (node.type === "ArrayExpression") return true;
  if (node.type === "CallExpression") {
    const method = arrayMethodTarget(node.callee);
    return (
      method !== null &&
      arrayReturningMethods.has(method.name) &&
      isKnownArrayExpression(sourceCode, method.object, knownBindings)
    );
  }
  if (node.type !== "Identifier") return false;
  const variable = resolveVariable(sourceCode, node);
  if (variable === null) return false;

  const cached = knownBindings.get(variable);
  if (cached !== undefined) return cached;
  // An alias follows a single initializer. Revisiting this binding makes the whole chain unknown.
  knownBindings.set(variable, false);
  const known = isKnownArrayBinding(sourceCode, variable, knownBindings);
  knownBindings.set(variable, known);
  return known;
}

function isKnownArrayBinding(
  sourceCode: SourceCode,
  variable: Variable,
  knownBindings: WeakMap<Variable, boolean>,
): boolean {
  if (variable.references.some((reference) => reference.isWrite() && !reference.init)) return false;
  for (const identifier of variable.identifiers) {
    const annotation = identifier.typeAnnotation?.typeAnnotation;
    if (annotation !== undefined) return isArrayAnnotation(annotation);
  }
  for (const definition of variable.defs) {
    if (
      definition.type === "Variable" &&
      definition.node.type === "VariableDeclarator" &&
      definition.node.id.type === "Identifier" &&
      definition.node.init !== null &&
      definition.node.parent.type === "VariableDeclaration" &&
      definition.node.parent.kind === "const"
    ) {
      return isKnownArrayExpression(sourceCode, definition.node.init, knownBindings);
    }
  }
  return false;
}
