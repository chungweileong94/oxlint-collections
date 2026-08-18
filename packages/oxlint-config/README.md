# `@cw/oxlint-config`

Opinionated Oxlint config with both strict and flexible.

## Installation

```sh
npm install -D @cw/oxlint-config oxlint
```

## Usage

Create an `oxlint.config.ts` in the consuming project:

```ts
import { defineConfig } from "oxlint";
import config from "@cw/oxlint-config";

export default defineConfig({
  options: {
    typeAware: true,
    typeCheck: true,
    reportUnusedDisableDirectives: "error",
  },
  extends: [config],
});
```
