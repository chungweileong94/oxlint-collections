import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it } from "vite-plus/test";
import defaultPlugin, { plugin } from "./index.ts";

it("exports the same plugin by name and as the default", () => {
  expect(plugin).toBe(defaultPlugin);
});

it("loads the plugin in Oxlint and runs every rule using a consumer alias", () => {
  const directory = mkdtempSync(join(tmpdir(), "oxlint-plugin-"));
  try {
    writeFileSync(
      join(directory, ".oxlintrc.json"),
      JSON.stringify({
        categories: { correctness: "off" },
        jsPlugins: [
          {
            name: "custom",
            specifier: fileURLToPath(new URL("./index.ts", import.meta.url)),
          },
        ],
        rules: {
          "custom/no-array-filter-map": "error",
          "custom/no-chained-type-assertions": "error",
          "custom/no-em-dash": "error",
          "custom/no-inline-component-props": "error",
          "custom/no-known-value-widening": "error",
          "custom/no-object-parameters": "error",
          "custom/no-unknown-returns": "error",
          "custom/no-use-effect": "error",
          "custom/no-widen-then-assert": "error",
          "custom/prefer-jsx-short-circuit": "error",
        },
      }),
    );
    const code = `import { useEffect as effect } from "react";
function Panel({ count }: { count: number }) { effect(() => {}, []); return <div title="&mdash;">{count ? <span /> : null}</div>; }
const numbers = [1, 2];
export const selected = numbers.filter(n => n > 1).map(n => n + 1);
export const cast = "raw" as unknown as string;
const widened: unknown = "sample";
export const narrowed = widened as string;
export function acceptsObject(input: object) { return input; }
export function returnsUnknown(input: unknown): unknown { return input; }`;
    writeFileSync(join(directory, "first.tsx"), code);
    writeFileSync(join(directory, "second.tsx"), code);
    writeFileSync(
      join(directory, "valid.tsx"),
      'interface Props { count: number } function Panel({ count }: Props) { return <div title="hello">{!!count && <span />}</div>; }',
    );
    writeFileSync(
      join(directory, "exception.tsx"),
      `import { useEffect } from "react";
function Widget() {
  // oxlint-disable-next-line custom/no-use-effect -- Synchronize the external widget.
  useEffect(() => {}, []);
  return null;
}`,
    );
    const cli = fileURLToPath(new URL("../bin/oxlint", import.meta.resolve("oxlint")));
    const result = spawnSync(
      process.execPath,
      [cli, "--config", ".oxlintrc.json", "--format", "json", "."],
      {
        cwd: directory,
        encoding: "utf8",
      },
    );

    expect(result.error).toBeUndefined();
    expect(result.stderr).toBe("");
    expect(result.status, result.stdout).toBe(1);
    const report = JSON.parse(result.stdout) as {
      diagnostics: { code: string; filename: string }[];
    };
    expect(report.diagnostics).toHaveLength(20);
    for (const filename of ["first.tsx", "second.tsx"]) {
      expect(
        report.diagnostics
          .filter((diagnostic) => diagnostic.filename === filename)
          .map((diagnostic) => diagnostic.code),
      ).toEqual(
        expect.arrayContaining([
          "custom(no-array-filter-map)",
          "custom(no-chained-type-assertions)",
          "custom(no-em-dash)",
          "custom(no-inline-component-props)",
          "custom(no-known-value-widening)",
          "custom(no-object-parameters)",
          "custom(no-unknown-returns)",
          "custom(no-use-effect)",
          "custom(no-widen-then-assert)",
          "custom(prefer-jsx-short-circuit)",
        ]),
      );
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
