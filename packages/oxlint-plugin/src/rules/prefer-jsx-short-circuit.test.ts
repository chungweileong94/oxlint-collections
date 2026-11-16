import { RuleTester } from "oxlint/plugins-dev";
import { describe, it } from "vite-plus/test";
import { preferJsxShortCircuitRule } from "./prefer-jsx-short-circuit.ts";

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: "tsx" } },
});

tester.run("prefer-jsx-short-circuit", preferJsxShortCircuitRule, {
  valid: [
    "<div>{ready && <Panel />}</div>;",
    "<div>{!!count && <Panel />}</div>;",
    "<div>{!ready && <Panel />}</div>;",
    "<div>{ready ? <Panel /> : <Spinner />}</div>;",
    "<div>{ready ? <Panel /> : 0}</div>;",
    '<div>{ready ? <Panel /> : ""}</div>;',
    "<div>{ready ? <Panel /> : true}</div>;",
    "<div>{ready ? null : false}</div>;",
    "<div>{ready ? 'yes' : null}</div>;",
    "<div>{ready ? 1 : null}</div>;",
    "const value = ready ? <Panel /> : null;",
    "function render() { return ready ? <Panel /> : null; }",
    "const render = () => ready ? <Panel /> : null;",
    "<div>{items.map(item => item.ready ? <Panel /> : null)}</div>;",
    "<Wrapper render={() => ready ? <Panel /> : null} />;",
    "<Wrapper content={ready ? <Panel /> : null} />;",
    "<Wrapper children={ready ? <Panel /> : null} />;",
    "<Wrapper {...(ready ? <Panel /> : null)} />;",
    "<div>{outer ? (ready ? <Panel /> : null) : <Spinner />}</div>;",
    "<div>{outer && (ready ? <Panel /> : null)}</div>;",
    "<div>{(ready ? <Panel /> : null) as React.ReactNode}</div>;",
    "function render(undefined) { return <div>{ready ? <Panel /> : undefined}</div>; }",
    "const undefined = <Spinner />; <div>{ready ? <Panel /> : undefined}</div>;",
    "function render(undefined) { return <div>{ready ? undefined : <Panel />}</div>; }",
  ],
  invalid: [
    ...(
      [
        ["<div>{ready ? <Panel /> : null}</div>;", "<div>{!!ready && <Panel />}</div>;"],
        ["<div>{ready ? null : <Panel />}</div>;", "<div>{!ready && <Panel />}</div>;"],
        ["<div>{ready ? <Panel /> : false}</div>;", "<div>{!!ready && <Panel />}</div>;"],
        ["<div>{ready ? false : <Panel />}</div>;", "<div>{!ready && <Panel />}</div>;"],
        ["<div>{ready ? <Panel /> : undefined}</div>;", "<div>{!!ready && <Panel />}</div>;"],
        ["<div>{ready ? undefined : <Panel />}</div>;", "<div>{!ready && <Panel />}</div>;"],
        ["<>{ready ? <Panel /> : null}</>;", "<>{!!ready && <Panel />}</>;"],
        ["<div>{ready ? <><Panel /></> : null}</div>;", "<div>{!!ready && <><Panel /></>}</div>;"],
        ["<div>{ready ? null : <><Panel /></>}</div>;", "<div>{!ready && <><Panel /></>}</div>;"],
        ["<div>{(ready ? <Panel /> : null)}</div>;", "<div>{(!!ready && <Panel />)}</div>;"],
        ["<div>{ready ? (<Panel />) : null}</div>;", "<div>{!!ready && <Panel />}</div>;"],
        ["<div>{count ? <Panel /> : null}</div>;", "<div>{!!count && <Panel />}</div>;"],
        ["<div>{0 ? <Panel /> : null}</div>;", "<div>{!!(0) && <Panel />}</div>;"],
        [
          "<div>{items.length ? <Panel /> : null}</div>;",
          "<div>{!!items.length && <Panel />}</div>;",
        ],
        [
          "<div>{items?.length ? <Panel /> : null}</div>;",
          "<div>{!!items?.length && <Panel />}</div>;",
        ],
        ["<div>{getValue() ? <Panel /> : null}</div>;", "<div>{!!getValue() && <Panel />}</div>;"],
        ["<div>{true ? <Panel /> : null}</div>;", "<div>{true && <Panel />}</div>;"],
        ["<div>{!ready ? <Panel /> : null}</div>;", "<div>{!ready && <Panel />}</div>;"],
        ["<div>{!!count ? <Panel /> : null}</div>;", "<div>{!!count && <Panel />}</div>;"],
        ["<div>{count > 0 ? <Panel /> : null}</div>;", "<div>{count > 0 && <Panel />}</div>;"],
        [
          "<div>{value === expected ? <Panel /> : null}</div>;",
          "<div>{value === expected && <Panel />}</div>;",
        ],
        [
          '<div>{"id" in value ? <Panel /> : null}</div>;',
          '<div>{"id" in value && <Panel />}</div>;',
        ],
        [
          "<div>{value instanceof Item ? <Panel /> : null}</div>;",
          "<div>{value instanceof Item && <Panel />}</div>;",
        ],
        ["<div>{count > 0 ? null : <Panel />}</div>;", "<div>{!(count > 0) && <Panel />}</div>;"],
        ["<div>{!ready ? null : <Panel />}</div>;", "<div>{!(!ready) && <Panel />}</div>;"],
        ["<div>{a || b ? <Panel /> : null}</div>;", "<div>{!!(a || b) && <Panel />}</div>;"],
        ["<div>{a && b ? null : <Panel />}</div>;", "<div>{!(a && b) && <Panel />}</div>;"],
        ["<div>{a ?? b ? <Panel /> : null}</div>;", "<div>{!!(a ?? b) && <Panel />}</div>;"],
        ["<div>{(a, b) ? <Panel /> : null}</div>;", "<div>{!!(a, b) && <Panel />}</div>;"],
        [
          "<div>{(ready = load()) ? <Panel /> : null}</div>;",
          "<div>{!!(ready = load()) && <Panel />}</div>;",
        ],
        [
          "<div>{(a ? b : c) ? <Panel /> : null}</div>;",
          "<div>{!!(a ? b : c) && <Panel />}</div>;",
        ],
        [
          "<div>{(value as boolean) ? <Panel /> : null}</div>;",
          "<div>{!!(value as boolean) && <Panel />}</div>;",
        ],
        [
          "<div>{count /* reason */ > 0 ? <Panel /> : null}</div>;",
          "<div>{count /* reason */ > 0 && <Panel />}</div>;",
        ],
        [
          "<div>{ready ? <Panel>{/* reason */}</Panel> : null}</div>;",
          "<div>{!!ready && <Panel>{/* reason */}</Panel>}</div>;",
        ],
      ] as const
    ).map(([code, output]) => ({
      code,
      output: null,
      errors: [
        {
          messageId: "preferShortCircuit",
          suggestions: [{ messageId: "replaceWithShortCircuit", output }],
        },
      ],
    })),
    ...[
      "<div>{ready /* reason */ ? <Panel /> : null}</div>;",
      "<div>{ready ? /* reason */ <Panel /> : null}</div>;",
      "<div>{ready ? <Panel /> : /* reason */ null}</div>;",
      "<div>{ready // reason\n ? <Panel /> : null}</div>;",
    ].map((code) => ({
      code,
      output: null,
      errors: [{ messageId: "preferShortCircuit", suggestions: [] }],
    })),
  ],
});
