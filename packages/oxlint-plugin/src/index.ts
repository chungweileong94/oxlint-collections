import { eslintCompatPlugin } from "@oxlint/plugins";
import { noEmDashRule } from "./rules/no-em-dash.ts";
import { noInlineComponentPropsRule } from "./rules/no-inline-component-props.ts";
import { noUseEffectRule } from "./rules/no-use-effect.ts";
import { preferJsxShortCircuitRule } from "./rules/prefer-jsx-short-circuit.ts";

const plugin = eslintCompatPlugin({
  meta: {
    name: "@chungwei/oxlint-plugin",
  },
  rules: {
    "no-em-dash": noEmDashRule,
    "no-inline-component-props": noInlineComponentPropsRule,
    "no-use-effect": noUseEffectRule,
    "prefer-jsx-short-circuit": preferJsxShortCircuitRule,
  },
});

export { plugin };
export default plugin;
