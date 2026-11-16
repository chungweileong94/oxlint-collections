import { RuleTester } from "oxlint/plugins-dev";
import { describe, it } from "vite-plus/test";
import { noUseEffectRule } from "./no-use-effect.ts";

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: "tsx" } },
});

tester.run("no-use-effect", noUseEffectRule, {
  valid: [
    'import { useState } from "react"; function Panel() { const [value] = useState(0); return <div>{value}</div>; }',
    'import { useEffect } from "react";',
    'import { useEffect } from "other-library"; useEffect(() => {});',
    'import { useEffect as effect } from "other-library"; effect(() => {});',
    'import React from "other-library"; React.useEffect(() => {});',
    'import * as React from "other-library"; React["useEffect"](() => {});',
    'import { useEffect as effect } from "react"; function run(effect) { effect(() => {}); }',
    'import { useEffect } from "react"; function run(useEffect) { useEffect(() => {}); }',
    'import React from "react"; function run(React) { React.useEffect(() => {}); }',
    'import * as R from "react"; function run(R) { R["useEffect"](() => {}); }',
    'import { useState as useEffect } from "react"; useEffect(0);',
    'import type { useEffect } from "react"; useEffect(() => {});',
    'import { type useEffect } from "react"; useEffect(() => {});',
    'import type React from "react"; React.useEffect(() => {});',
    'import type * as React from "react"; React.useEffect(() => {});',
    'import { type default as React } from "react"; React.useEffect(() => {});',
    "function useEffect(callback) { callback(); } useEffect(() => {});",
    "const React = { useEffect(callback) { callback(); } }; React.useEffect(() => {});",
    "function run(useEffect) { useEffect(() => {}); }",
    "function run(React) { React.useEffect(() => {}); }",
    'import * as R from "react"; R.useState(0);',
    'import * as R from "react"; R[method](() => {});',
    'import { useEffect } from "react"; { const useEffect = other; useEffect(() => {}); }',
    'import React from "react"; try {} catch (React) { React.useEffect(() => {}); }',
    'import { useEffect } from "react"; const run = function useEffect() { useEffect(); };',
    'import * as R from "react"; R.nested.useEffect(() => {});',
  ],
  invalid: [
    ...[
      "useEffect(() => {}, []);",
      "React.useEffect(() => {}, []);",
      'React["useEffect"](() => {}, []);',
      'import { useEffect } from "react"; useEffect(() => {}, []);',
      'import { useEffect as effect } from "react"; effect(() => {}, []);',
      'import { "useEffect" as effect } from "react"; effect(() => {}, []);',
      'import React from "react"; React.useEffect(() => {}, []);',
      'import R from "react"; R.useEffect(() => {}, []);',
      'import * as R from "react"; R.useEffect(() => {}, []);',
      'import * as R from "react"; R["useEffect"](() => {}, []);',
      'import { default as R } from "react"; R.useEffect(() => {}, []);',
      'import { useEffect } from "react"; function Panel() { useEffect(() => {}, []); return <div />; }',
      'import { useEffect } from "react"; function useConnection() { useEffect(() => {}, []); }',
      'function useConnection() { effect(() => {}, []); } import { useEffect as effect } from "react";',
      'import { useEffect as effect } from "react"; effect?.(() => {}, []);',
      'import * as R from "react"; R?.useEffect(() => {}, []);',
      'import * as R from "react"; R.useEffect?.(() => {}, []);',
      'import { useEffect } from "react"; (useEffect)(() => {}, []);',
      'import { useEffect } from "react"; useEffect!(() => {}, []);',
      'import { useEffect } from "react"; (useEffect as Function)(() => {}, []);',
      'import * as R from "react"; (R as typeof React).useEffect(() => {}, []);',
      'import * as R from "react"; (R.useEffect satisfies Function)(() => {}, []);',
      'import { useEffect } from "react"; { const useEffect = other; } useEffect(() => {}, []);',
    ].map((code) => ({
      code,
      errors: [{ messageId: "noUseEffect" }],
      output: null,
    })),
    ...["component.js", "component.jsx", "hook.ts", "component.tsx"].map((filename) => ({
      filename,
      code: 'import { useEffect } from "react"; useEffect(() => {}, []);',
      errors: [{ messageId: "noUseEffect" }],
    })),
    {
      code: 'import { useEffect as effect } from "react"; import * as R from "react"; effect(() => {}, []); R.useEffect(() => {}, []);',
      errors: [{ messageId: "noUseEffect" }, { messageId: "noUseEffect" }],
    },
  ],
});
