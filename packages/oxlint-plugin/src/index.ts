import { eslintCompatPlugin } from "@oxlint/plugins";
import { noArrayFilterMapRule } from "./rules/anti-slop/no-array-filter-map.ts";
import { noChainedTypeAssertionsRule } from "./rules/anti-slop/no-chained-type-assertions.ts";
import { noEmDashRule } from "./rules/no-em-dash.ts";
import { noInlineComponentPropsRule } from "./rules/no-inline-component-props.ts";
import { noKnownValueWideningRule } from "./rules/anti-slop/no-known-value-widening.ts";
import { noObjectParametersRule } from "./rules/anti-slop/no-object-parameters.ts";
import { noUnknownReturnsRule } from "./rules/anti-slop/no-unknown-returns.ts";
import { noUseEffectRule } from "./rules/no-use-effect.ts";
import { noWidenThenAssertRule } from "./rules/anti-slop/no-widen-then-assert.ts";
import { preferJsxShortCircuitRule } from "./rules/prefer-jsx-short-circuit.ts";

const plugin = eslintCompatPlugin({
  meta: {
    name: "@chungwei/oxlint-plugin",
  },
  rules: {
    "no-array-filter-map": noArrayFilterMapRule,
    "no-chained-type-assertions": noChainedTypeAssertionsRule,
    "no-em-dash": noEmDashRule,
    "no-inline-component-props": noInlineComponentPropsRule,
    "no-known-value-widening": noKnownValueWideningRule,
    "no-object-parameters": noObjectParametersRule,
    "no-unknown-returns": noUnknownReturnsRule,
    "no-use-effect": noUseEffectRule,
    "no-widen-then-assert": noWidenThenAssertRule,
    "prefer-jsx-short-circuit": preferJsxShortCircuitRule,
  },
});

export { plugin };
export default plugin;
