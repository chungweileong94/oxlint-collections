import { RuleTester } from "oxlint/plugins-dev";
import { describe, it } from "vite-plus/test";
import { noEmDashRule } from "./no-em-dash.ts";

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: "tsx" } },
});

tester.run("no-em-dash", noEmDashRule, {
  valid: [
    'const text = "Use other punctuation - or words.";',
    'const text = "\\u2013";',
    'const text = "&mdash;";',
    "const text = `hello ${name}`;",
    '<p title="hello">World &ndash; hello</p>;',
    '<p title={"&mdash;"} />;',
    "const count = 8212;",
    "const pattern = /\u2014/;",
    '// \u2014\nconst text = "hello";',
  ],
  invalid: [
    ...[
      'const text = "hello \u2014 world";',
      'const text = "\\u2014";',
      'const text = "\\u{2014}";',
      "const text = `hello \u2014 ${name}`;",
      "const text = `${name} \\u2014 world`;",
      "const text = String.raw`\\unicode \u2014`;",
      "<p>hello \u2014 world</p>;",
      '<p title="hello \u2014 world" />;',
      '<p>{"\\u2014"}</p>;',
      ...["&mdash;", "&#8212;", "&#08212;", "&#x2014;", "&#X002014;"].flatMap((entity) => [
        `<p>${entity}</p>;`,
        `<p title="${entity}" />;`,
      ]),
    ].map((code) => ({
      code,
      errors: [{ messageId: "noEmDash" }],
    })),
    {
      code: 'const text = `\u2014${"\\u2014"}\u2014`;',
      errors: Array.from({ length: 3 }, () => ({ messageId: "noEmDash" })),
    },
  ],
});
