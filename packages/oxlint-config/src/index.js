import { defineConfig } from "oxlint";

const config = defineConfig({
  plugins: ["eslint", "unicorn", "typescript", "oxc", "react"],
  categories: {
    correctness: "error",
    suspicious: "error",
  },
  rules: {
    "no-var": "error",
    "no-console": [
      "error",
      {
        allow: ["warn", "error", "info"],
      },
    ],
    "no-underscore-dangle": "off",

    "typescript/no-require-imports": "error",
    "typescript/no-explicit-any": "error",
    "typescript/ban-ts-comment": "error",
    "typescript/consistent-type-imports": "error",
    "typescript/no-unnecessary-type-constraint": "error",
    "typescript/no-non-null-assertion": "error",
    "typescript/no-unsafe-type-assertion": "off",
    "typescript/no-unnecessary-type-arguments": "off",
    "typescript/no-unnecessary-type-parameters": "off",
    "typescript/consistent-return": "off",

    "react/exhaustive-deps": "error",
    "react/rules-of-hooks": "error",
    "react/error-boundaries": "error",
    "react/globals": "error",
    "react/immutability": "error",
    "react/incompatible-library": "error",
    "react/preserve-manual-memoization": "error",
    "react/purity": "error",
    "react/refs": "error",
    "react/set-state-in-effect": "error",
    "react/set-state-in-render": "error",
    "react/static-components": "error",
    "react/unsupported-syntax": "error",
    "react/use-memo": "error",
    "react/self-closing-comp": "error",
    "react/no-unstable-nested-components": ["error", { allowAsProps: true }],
    "react/react-in-jsx-scope": "off",
  },
});

export { config };
export default config;
