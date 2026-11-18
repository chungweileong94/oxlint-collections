# `@chungwei/oxlint-plugin`

Custom Oxlint rules for JavaScript, TypeScript, and React.

## Installation

```sh
npm install -D @chungwei/oxlint-plugin oxlint
```

## Usage

Add the plugin and enable the rules in `oxlint.config.ts`:

```ts
import { defineConfig } from "oxlint";

export default defineConfig({
  jsPlugins: [{ name: "chungwei", specifier: "@chungwei/oxlint-plugin" }],
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
  },
});
```

The same `jsPlugins` and `rules` entries work under `lint` in a Vite+ config. All rules accept no options. Enable them individually when using this plugin directly. `@chungwei/oxlint-config` installs the plugin and enables all its rules as errors.

The plugin is also available as both a default and a named export:

```ts
import plugin from "@chungwei/oxlint-plugin";
import { plugin as namedPlugin } from "@chungwei/oxlint-plugin";
```

When replacing the app's local plugin, use the alias `custom` instead of `chungwei` to keep existing `custom/*` rule settings and disable comments.

## Rules

| Rule                         | Behavior                                                                                 | Fix               |
| ---------------------------- | ---------------------------------------------------------------------------------------- | ----------------- |
| `no-array-filter-map`        | Disallows adjacent `filter` and `map` calls on arrays.                                   | None              |
| `no-chained-type-assertions` | Disallows consecutive TypeScript assertions unless each one is `as const`.               | None              |
| `no-em-dash`                 | Disallows em dashes in string literals, template text, JSX text, and JSX attribute text. | None              |
| `no-inline-component-props`  | Requires named types for destructured component props in `.tsx` files.                   | None              |
| `no-known-value-widening`    | Disallows discarding known value types through explicitly broad or anonymous types.      | None              |
| `no-object-parameters`       | Disallows the broad `object` type in function parameter contracts.                       | None              |
| `no-unknown-returns`         | Disallows explicit `unknown` return contracts, including promise-like results.           | None              |
| `no-use-effect`              | Disallows direct React `useEffect` calls in components and custom hooks.                 | None              |
| `no-widen-then-assert`       | Disallows widening a known value in a local `const` and later asserting it narrower.     | None              |
| `prefer-jsx-short-circuit`   | Prefers short-circuit rendering for JSX child ternaries with one empty branch.           | Editor suggestion |

### `no-array-filter-map`

Checks both `filter().map()` and `map().filter()` on array literals, directly annotated arrays and tuples, and supported chains through immutable local bindings. Lazy iterator chains and receivers with no local array evidence are allowed. For a rewrite, consider `flatMap`, a single loop, or iterator helpers where the target runtime supports them. Review callback order, indexes, and sparse-array behavior when changing the pipeline.

### `no-chained-type-assertions`

Reports chains such as `value as unknown as User`, including parenthesized and angle-bracket assertions. Single assertions and chains consisting entirely of const assertions are allowed.

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

### `no-known-value-widening`

Reports known values flowing into explicit `unknown`, `object`, anonymous object, or open dictionary types. It checks annotations, assignments, assertions, returns, and known arguments passed to local type predicates whose subject is `unknown`. Named object contracts, finite-key records, and empty dictionary accumulators are allowed.

### `no-object-parameters`

Reports parameters declared as `object` or a union containing it. It follows visible local type aliases, including transparent generic aliases. Narrower types such as `Record<string, string>` are allowed.

### `no-unknown-returns`

Reports explicit return types that resolve to `unknown`, a union containing `unknown`, or `Promise` and `PromiseLike` wrapping these types. It follows visible local aliases and leaves inferred returns alone.

### `no-use-effect`

`useEffect` is hard to use correctly without experience with React. Choosing dependencies, avoiding stale closures, and handling setup and cleanup require understanding how Effects interact with rendering. Mistakes can cause repeated updates, stale data, or subscriptions that never get cleaned up.

This rule bans direct `useEffect` calls by default to steer developers and coding agents toward simpler patterns. Calculate derived values during render, handle user actions in event handlers, and use the project's data fetching or subscription hooks where appropriate. For example, deriving a greeting from a prop needs no Effect or extra state:

```tsx
// Reported
import { useEffect } from "react";

function Greeting({ name }: GreetingProps) {
  const [greeting, setGreeting] = useState("");
  useEffect(() => {
    setGreeting(`Hello, ${name}`);
  }, [name]);
  return <p>{greeting}</p>;
}

// Allowed
function Greeting({ name }: GreetingProps) {
  const greeting = `Hello, ${name}`;
  return <p>{greeting}</p>;
}
```

See React's [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) guide for more alternatives. Do not move side effects into render, `useMemo`, or `useLayoutEffect` to bypass this rule.

Effects are still appropriate for synchronizing with external systems. When one is necessary, use a narrow disable comment explaining why, or turn the rule off for a specific integration file through a config override:

```tsx
// oxlint-disable-next-line chungwei/no-use-effect -- Keep the external widget synchronized with the selected value.
useEffect(() => {
  widget.setValue(value);
}, [widget, value]);
```

The rule checks components and custom hooks in JavaScript and TypeScript, recognizes React import aliases and namespace access, and reports unbound `useEffect` and `React.useEffect` calls. Shadowed names, imports from other libraries, and type-only imports are ignored. It checks direct calls only; it does not trace variable aliases, re-exports, CommonJS imports, or dynamic property access. There is no automatic fix because the replacement depends on the Effect's purpose.

### `no-widen-then-assert`

Reports flows such as `const widened: unknown = "value"; widened as string;`. It checks immutable local bindings in the same function or at module scope, including explicit widenings to `unknown`, `any`, `object`, and broad records.

### `prefer-jsx-short-circuit`

Reports a ternary directly in JSX children when one branch is JSX and the other is `null`, `false`, or unshadowed `undefined`.

```tsx
// Reported
<div>{count ? <Panel /> : null}</div>;

// Suggested
<div>{!!count && <Panel />}</div>;
```

Suggestions coerce conditions to booleans when needed so falsy numbers do not render as text. For an empty truthy branch, the suggestion negates the condition. The rule offers no suggestion if replacement would discard a comment. It does not automatically fix code, and does not check ternaries in attributes, callbacks, or ordinary return expressions.
