import { fileURLToPath } from "node:url";
import { defineConfig } from "oxlint";

const config = defineConfig({
  plugins: ["eslint", "unicorn", "typescript", "oxc", "react"],
  jsPlugins: [
    {
      name: "chungwei",
      specifier: fileURLToPath(import.meta.resolve("@chungwei/oxlint-plugin")),
    },
  ],
  categories: {
    correctness: "error",
    suspicious: "error",
  },
  rules: {
    "chungwei/no-array-filter-map": "error",
    "chungwei/no-chained-type-assertions": "error",
    "chungwei/no-em-dash": "error",
    "chungwei/no-inline-component-props": "error",
    "chungwei/no-known-value-widening": "error",
    "chungwei/no-object-parameters": "error",
    "chungwei/no-unknown-returns": "error",
    "chungwei/no-use-effect": "error",
    "chungwei/no-widen-then-assert": "error",
    "chungwei/prefer-jsx-short-circuit": "error",

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
