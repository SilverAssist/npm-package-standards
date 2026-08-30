/**
 * Shared ESLint base for Silver Assist's published npm packages that ship
 * React components (icons, recaptcha, consent-banner). Extends
 * {@link "./base.mjs"} with JSX parsing and the React rules every one of
 * those three already converged on independently.
 *
 * @example
 * ```javascript
 * // eslint.config.mjs
 * import react from "@silverassist/npm-package-standards/eslint/react";
 * import tseslint from "typescript-eslint";
 *
 * export default tseslint.config(
 *   ...react,
 *   { ignores: ["dist/**"] },
 * );
 * ```
 */
import reactPlugin from "eslint-plugin-react";

import base from "./base.mjs";

export default [
  ...base,
  {
    files: ["**/*.tsx"],
    plugins: {
      react: reactPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
];
