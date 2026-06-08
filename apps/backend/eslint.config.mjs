import baseConfig from "../../eslint.config.base.mjs";

export default [
  ...baseConfig,
  {
    ignores: ["node_modules/**", "dist/**"],
  },
  {
    rules: {
      // `_` プレフィックスの引数は意図的な未使用として許可する
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];
