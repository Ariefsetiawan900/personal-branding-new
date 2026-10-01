import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      'dist/**',
      '.astro/**',
      '.pnpm-store/**',
      'node_modules/**',
      'work/**',
      'Assets/**',
      'public/**',
      'tests/visual/legacy/**',
      'test-results/**',
      'playwright-report/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs['flat/recommended'],
  ...astro.configs['flat/jsx-a11y-recommended'],
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: { '@typescript-eslint/no-explicit-any': 'error' },
  },
  {
    files: ['**/*.astro'],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  {
    files: ['src/components/ProjectModal.astro'],
    // The scrollable dialog must be keyboard-focusable for axe and Safari.
    rules: { 'astro/jsx-a11y/no-noninteractive-tabindex': 'off' },
  },
];
