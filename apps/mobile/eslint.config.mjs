import baseConfig from "../../eslint.config.base.mjs";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";

export default [
  ...baseConfig,
  pluginReact.configs.flat.recommended,
  pluginReactHooks.configs.flat["recommended-latest"],
  {
    settings: { react: { version: "detect" } },
    rules: {
      "react/react-in-jsx-scope": "off",
    },
  },
  {
    ignores: ["node_modules/**", ".expo/**"],
  },
];
