import { defineConfig } from 'vitest/config';

/**
 * Vitest Configuration for API and Property Tests
 */
export default defineConfig({
  test: {
    // Test directories
    include: [
      'tests/api/**/*.spec.ts',
      'tests/properties/**/*.property.ts',
      'tests/performance/**/*.spec.ts',
    ],
    
    // Exclude E2E tests (handled by Playwright)
    exclude: ['tests/e2e/**/*'],
    
    // Global timeout
    testTimeout: 30000,
    
    // Reporter
    reporters: ['verbose', 'json'],
    outputFile: 'test-results/vitest-results.json',
    
    // Coverage (optional)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: 'test-results/coverage',
    },
    
    // Environment
    environment: 'node',
    
    // Globals
    globals: true,
  },
});
