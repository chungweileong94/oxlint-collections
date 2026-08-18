import { defineConfig } from "vite-plus";
import config from "./packages/oxlint-config/src/index.ts";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
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
  },
});
