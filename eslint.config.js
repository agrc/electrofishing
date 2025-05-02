// eslint.config.js
import { browser } from '@ugrc/eslint-config';

export default [
  ...browser,
  { ignores: ['./playwright-report/**'] },
  {
    rules: {
      'jsx-a11y/label-has-associated-control': 'off',
      'jsx-a11y/anchor-is-valid': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/tabindex-no-positive': 'off',
    },
    languageOptions: { globals: { L: 'readonly', $: 'readonly' } },
  },
];
