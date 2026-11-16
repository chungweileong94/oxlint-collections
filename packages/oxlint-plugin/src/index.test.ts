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
          "custom/no-em-dash": "error",
          "custom/no-inline-component-props": "error",
          "custom/prefer-jsx-short-circuit": "error",
        },
      }),
    );
    const code =
      'function Panel({ count }: { count: number }) { return <div title="&mdash;">{count ? <span /> : null}</div>; }';
    writeFileSync(join(directory, "first.tsx"), code);
    writeFileSync(join(directory, "second.tsx"), code);
    writeFileSync(
      join(directory, "valid.tsx"),
      'interface Props { count: number } function Panel({ count }: Props) { return <div title="hello">{!!count && <span />}</div>; }',
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
    expect(report.diagnostics).toHaveLength(6);
    for (const filename of ["first.tsx", "second.tsx"]) {
      expect(
        report.diagnostics
          .filter((diagnostic) => diagnostic.filename === filename)
          .map((diagnostic) => diagnostic.code),
      ).toEqual(
        expect.arrayContaining([
          "custom(no-em-dash)",
          "custom(no-inline-component-props)",
          "custom(prefer-jsx-short-circuit)",
        ]),
      );
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
