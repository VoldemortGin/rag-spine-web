import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import { baseConfig } from '../../eslint.config.mjs';

const eslintConfig = defineConfig([
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', '.source/**']),
  ...nextVitals,
  ...baseConfig,
]);

export default eslintConfig;
