import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.js', 'src/**/*.spec.js'],
    setupFiles: ['./src/test/setup.js'],
    pool: 'forks', // Use forks for isolation if needed
  },
});
