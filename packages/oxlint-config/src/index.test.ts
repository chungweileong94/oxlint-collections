import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it } from "vite-plus/test";
import config from "./index.js";

it("enables every custom rule through the shared config and allows overrides", () => {
  const directory = mkdtempSync(join(tmpdir(), "oxlint-config-"));
  try {
    writeFileSync(join(directory, ".oxlintrc.json"), JSON.stringify(config));
    writeFileSync(
      join(directory, "invalid.tsx"),
      'import { useEffect } from "react"; export function Panel({ count }: { count: number }) { useEffect(() => {}, []); return <div title="&mdash;">{count ? <span /> : null}</div>; }',
    );
    writeFileSync(
      join(directory, "valid.tsx"),
      'interface Props { count: number } export function Panel({ count }: Props) { return <div title="hello">{!!count && <span />}</div>; }',
    );
    const cli = fileURLToPath(new URL("../bin/oxlint", import.meta.resolve("oxlint")));
    const lint = () =>
      spawnSync(process.execPath, [cli, "--config", ".oxlintrc.json", "--format", "json", "."], {
        cwd: directory,
        encoding: "utf8",
      });
    const result = lint();
    expect(result.error).toBeUndefined();
    expect(result.stderr).toBe("");
    expect(result.status, result.stdout).toBe(1);
    const report = JSON.parse(result.stdout) as {
      diagnostics: { code: string; severity: string; filename: string }[];
    };
    expect(report.diagnostics).toHaveLength(4);
    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(
      expect.arrayContaining([
        "chungwei(no-em-dash)",
        "chungwei(no-inline-component-props)",
        "chungwei(no-use-effect)",
        "chungwei(prefer-jsx-short-circuit)",
      ]),
    );
    expect(
      report.diagnostics.every(
        (diagnostic) => diagnostic.severity === "error" && diagnostic.filename === "invalid.tsx",
      ),
    ).toBe(true);

    writeFileSync(
      join(directory, ".oxlintrc.json"),
      JSON.stringify({
        ...config,
        rules: {
          ...config.rules,
          "chungwei/no-em-dash": "off",
          "chungwei/no-inline-component-props": "off",
          "chungwei/no-use-effect": "off",
          "chungwei/prefer-jsx-short-circuit": "off",
        },
      }),
    );
    const overridden = lint();
    expect(overridden.error).toBeUndefined();
    expect(overridden.stderr).toBe("");
    expect(overridden.status, overridden.stdout).toBe(0);
    expect(JSON.parse(overridden.stdout)).toMatchObject({ diagnostics: [] });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
