# `@chungwei/oxlint-config`

Opinionated Oxlint config with both strict and flexible.

Includes `@chungwei/oxlint-plugin` and enables all its rules as errors.

The plugin is a dependency of this config and needs no separate installation or registration. See the [plugin documentation](../oxlint-plugin/README.md) for rule behavior.

## Installation

```sh
npm install -D @chungwei/oxlint-config oxlint
```

## Usage

Create an `oxlint.config.ts` in the consuming project:

```ts
import { defineConfig } from "oxlint";
import config from "@chungwei/oxlint-config";

export default defineConfig({
  options: {
    typeAware: true,
    typeCheck: true,
    reportUnusedDisableDirectives: "error",
  },
  extends: [config],
});
```
