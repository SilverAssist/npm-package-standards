/**
 * Shared ESLint base for Silver Assist's published npm packages
 * (non-React: plain TypeScript logic). Spread into a consumer's own flat
 * config array or `tseslint.config(...)` call — both accept a plain array
 * of config objects, so this works with either composition style already
 * in use across the fleet.
 *
 * Formatting is Prettier's job, not ESLint's: this pulls in
 * `eslint-config-prettier` to turn off any stylistic rule that would
 * conflict with it, rather than running Prettier as a lint rule
 * (`eslint-plugin-prettier`) — one fewer thing for `eslint --fix` to do,
 * and `prettier --check` in CI is the actual formatting gate.
 *
 * @example
 * ```javascript
 * // eslint.config.mjs
 * import base from "@silverassist/npm-package-standards/eslint/base";
 * import tseslint from "typescript-eslint";
 *
 * export default tseslint.config(
 *   ...base,
 *   { ignores: ["dist/**"] },
 * );
 * ```
 */
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },
];
