import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import react from 'eslint-plugin-react';
import prettier from 'eslint-plugin-prettier';
import _import from 'eslint-plugin-import';
import reactHooks from 'eslint-plugin-react-hooks';
import testingLibrary from 'eslint-plugin-testing-library';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      '**/.github',
      '**/.vscode',
      '**/.release-please-manifest.json',
      '**/CHANGELOG.md',
      '**/build',
      '**/data',
      '**/dist',
      '**/emulator_data',
      '**/firebase-export*',
      '**/maps',
      '**/mockups',
      '**/node_modules',
      '**/package-lock.json',
      'public/ServiceWorker.js',
      '**/scripts',
      'tests/data',
    ],
  },
  ...fixupConfigRules(
    compat.extends(
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:react/jsx-runtime',
      'plugin:react-hooks/recommended',
      'plugin:import/recommended',
      'prettier',
    ),
  ),
  {
    plugins: {
      react: fixupPluginRules(react),
      prettier,
      import: fixupPluginRules(_import),
      'react-hooks': fixupPluginRules(reactHooks),
      'testing-library': testingLibrary,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jquery,
        ...globals.node,
        L: 'readonly',
      },

      ecmaVersion: 'latest',
      sourceType: 'module',
      ...react.configs.flat.recommended.languageOptions,

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
