import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import globals from "globals";

export default defineConfig([
  {
    ignores: ["node_modules/**", "dist/**", "build/**", ".git/**", "*.min.js"],
  },
  {
    files: ["**/*.mjs"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    files: ["**/*.js"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.node, // Node.js global variables 설정 (https://eslint.org/docs/latest/use/configure/language-options#predefined-global-variables)
      },
    },
    rules: {
      "no-unused-vars": "warn",
    },
  },
]);
