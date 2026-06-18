// Shared, type-aware ESLint flat config (the project-level engineering charter).
// Apps compose this with their own framework presets (e.g. eslint-config-next).
import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

/**
 * Type-aware base config. Consumers spread it and then add framework presets +
 * a `globalIgnores`. `projectService: true` lets typescript-eslint find each
 * file's tsconfig, which is required by the `no-unsafe-*` / `no-floating-promises`
 * family of type-aware rules.
 */
export const baseConfig = tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      // Escape hatches shut.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-ignore': true, 'ts-expect-error': 'allow-with-description' },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      // No silent failures (type-aware).
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
    },
  },
  // Type-aware rules require type information; turn them off for plain JS/config files.
  {
    files: ['**/*.{js,mjs,cjs}'],
    ...tseslint.configs.disableTypeChecked,
  },
  // Must be last: turn off stylistic rules that conflict with Prettier.
  eslintConfigPrettier,
);

export default baseConfig;
