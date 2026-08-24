import js from "@eslint/js";

export default [
  /**
   * ============================================================
   * Global Ignores
   * ============================================================
   */

  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "coverage/**",
      "logs/**",
      "*.log",
    ],
  },

  /**
   * ============================================================
   * ESLint Recommended Rules
   * ============================================================
   */

  js.configs.recommended,

  /**
   * ============================================================
   * Node.js / Backend Configuration
   * ============================================================
   */

  {
    files: ["**/*.js"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",

      globals: {
        /**
         * Node.js globals
         */

        console: "readonly",
        process: "readonly",
        Buffer: "readonly",

        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",

        setImmediate: "readonly",
        clearImmediate: "readonly",

        URL: "readonly",
        URLSearchParams: "readonly",
      },
    },

    rules: {
      /**
       * Console logging is intentionally allowed
       * because the backend uses console output for
       * startup, seeding and development diagnostics.
       */

      "no-console": "off",

      /**
       * Unused variables are warnings rather than
       * errors during the current development phase.
       */

      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
];