import nextConfig from 'eslint-config-next';

export default [
  ...nextConfig,
  {
    ignores: ['**/*.test.ts', '**/*.test.tsx', 'vitest.config.ts', 'vitest.setup.ts'],
  },
];