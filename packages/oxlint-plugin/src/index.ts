import { eslintCompatPlugin } from "@oxlint/plugins";
import { noEmDashRule } from "./rules/no-em-dash.ts";
import { noInlineComponentPropsRule } from "./rules/no-inline-component-props.ts";
import { preferJsxShortCircuitRule } from "./rules/prefer-jsx-short-circuit.ts";

const plugin = eslintCompatPlugin({
  meta: {
    name: "@chungwei/oxlint-plugin",
  },
  rules: {
    "no-em-dash": noEmDashRule,
    "no-inline-component-props": noInlineComponentPropsRule,
    "prefer-jsx-short-circuit": preferJsxShortCircuitRule,
  },
});

export { plugin };
export default plugin;
