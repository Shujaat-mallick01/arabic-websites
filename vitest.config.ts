import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['packages/*/test/**/*.test.ts', 'scripts/test/**/*.test.ts'],
    // Run in a zone far from the Gulf so any code that reads the machine's zone fails loudly.
    env: { TZ: process.env.AW_TEST_TZ ?? 'America/Los_Angeles' },
    coverage: { include: ['packages/*/src/**/*.ts'] },
  },
});
