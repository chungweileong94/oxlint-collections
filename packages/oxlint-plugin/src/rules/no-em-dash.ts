import { defineRule } from "@oxlint/plugins";

const emDash = /\u2014/;
const jsxEmDash = /\u2014|&(?:mdash|#0*8212|#[xX]0*2014);/;

export const noEmDashRule = defineRule({
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow em dashes in source text",
    },
    schema: [],
    messages: {
      noEmDash: "Do not use em dashes in text. Use words or other punctuation.",
    },
  },
  createOnce(context) {
    return {
      Literal(node) {
        const hasEmDash =
          typeof node.value === "string" &&
          (node.parent.type === "JSXAttribute"
            ? jsxEmDash.test(node.value)
            : emDash.test(node.value));
        if (hasEmDash) {
          context.report({ node, messageId: "noEmDash" });
        }
      },
      JSXText(node) {
        if (jsxEmDash.test(node.value)) {
          context.report({ node, messageId: "noEmDash" });
        }
      },
      TemplateElement(node) {
        if (emDash.test(node.value.cooked ?? node.value.raw)) {
          context.report({ node, messageId: "noEmDash" });
        }
      },
    };
  },
});
