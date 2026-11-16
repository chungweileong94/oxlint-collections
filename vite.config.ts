import { defineConfig } from "vite-plus";
import config from "./packages/oxlint-config/src/index.js";

export default defineConfig({
  staged: {
    "*": "pnpm check --fix",
  },
  fmt: {
    ignorePatterns: [],
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
      reportUnusedDisableDirectives: "error",
    },
    extends: [config],
    overrides: [
      {
        files: ["packages/oxlint-plugin/src/rules/no-em-dash.test.ts"],
        rules: {
          "chungwei/no-em-dash": "off",
        },
      },
    ],
  },
});
