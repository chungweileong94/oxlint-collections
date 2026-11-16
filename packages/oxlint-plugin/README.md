# `@chungwei/oxlint-plugin`

Custom Oxlint rules migrated from paint-mixer-app.

## Installation

```sh
npm install -D @chungwei/oxlint-plugin oxlint
```

Requires Oxlint 1.79.0 or later. The rules are authored in TypeScript and published as unbundled JavaScript with TypeScript declarations. Consumers need no build step, TypeScript loader, or Vite+ runtime.

## Usage

Add the plugin and enable the rules in `oxlint.config.ts`:

```ts
import { defineConfig } from "oxlint";

export default defineConfig({
  jsPlugins: [{ name: "chungwei", specifier: "@chungwei/oxlint-plugin" }],
  rules: {
    "chungwei/no-em-dash": "error",
    "chungwei/no-inline-component-props": "error",
    "chungwei/prefer-jsx-short-circuit": "error",
  },
});
```

The same `jsPlugins` and `rules` entries work under `lint` in a Vite+ config. All rules accept no options. Enable them individually when using this plugin directly. `@chungwei/oxlint-config` installs the plugin and enables all three rules as errors.

The plugin is also available as both a default and a named export:

```ts
import plugin from "@chungwei/oxlint-plugin";
import { plugin as namedPlugin } from "@chungwei/oxlint-plugin";
```

When replacing the app's local plugin, use the alias `custom` instead of `chungwei` to keep existing `custom/*` rule settings and disable comments.

## Rules

| Rule                        | Behavior                                                                                 | Fix               |
| --------------------------- | ---------------------------------------------------------------------------------------- | ----------------- |
| `no-em-dash`                | Disallows em dashes in string literals, template text, JSX text, and JSX attribute text. | None              |
| `no-inline-component-props` | Requires named types for destructured component props in `.tsx` files.                   | None              |
| `prefer-jsx-short-circuit`  | Prefers short-circuit rendering for JSX child ternaries with one empty branch.           | Editor suggestion |

### `no-em-dash`

Checks decoded strings and templates, including Unicode escapes. JSX text and literal JSX attributes also recognize `&mdash;`, decimal `&#8212;`, and hexadecimal `&#x2014;` entities, including leading zeros. Comments, regular expressions, and entity text in ordinary JavaScript strings are allowed.

### `no-inline-component-props`

Reports inline object types within the first parameter's annotation when props are destructured. It recognizes uppercase function and variable names, `memo` and `forwardRef` wrappers, and default exports that return JSX. React import aliases and shadowed bindings are taken into account.

```tsx
// Reported
function Panel({ title }: { title: string }) {
  return <h2>{title}</h2>;
}

// Allowed
interface PanelProps {
  title: string;
}

function Panel({ title }: PanelProps) {
  return <h2>{title}</h2>;
}
```

Non-destructured props, named types, ordinary helper functions, and files other than `.tsx` are allowed. The rule does not rename or extract types automatically.

### `prefer-jsx-short-circuit`

Reports a ternary directly in JSX children when one branch is JSX and the other is `null`, `false`, or unshadowed `undefined`.

```tsx
// Reported
<div>{count ? <Panel /> : null}</div>;

// Suggested
<div>{!!count && <Panel />}</div>;
```

Suggestions coerce conditions to booleans when needed so falsy numbers do not render as text. For an empty truthy branch, the suggestion negates the condition. The rule offers no suggestion if replacement would discard a comment. It does not automatically fix code, and does not check ternaries in attributes, callbacks, or ordinary return expressions.
