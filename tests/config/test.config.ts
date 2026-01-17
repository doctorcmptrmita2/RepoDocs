/**
 * Test Configuration
 * 
 * Central configuration for all production tests
 */

export interface TestConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  workers: number;
  testUser?: {
    email: string;
    sessionToken: string;
  };
}

export const config: TestConfig = {
  baseUrl: process.env.TEST_BASE_URL || 'https://repodocs.dev',
  timeout: 30000,
  retries: 2,
  workers: 4,
};

// Test endpoints
export const endpoints = {
  // Public pages
  homepage: '/',
  login: '/login',
  pricing: '/#pricing',
  features: '/#features',
  
  // Dashboard (requires auth)
  dashboard: '/dashboard',
  newProject: '/dashboard/new',
  projectSettings: (slug: string) => `/dashboard/${slug}/settings`,
  
  // Docs
  docs: (project: string, version: string, slug?: string) => 
    slug ? `/docs/${project}/${version}/${slug}` : `/docs/${project}/${version}`,
  demoDocs: '/docs/repodocs/main',
  
  // API
  api: {
    health: '/api/health',
    search: '/api/search',
    projects: '/api/projects',
    webhook: '/api/webhook/github',
  },
};

// Performance thresholds
export const performanceThresholds = {
  pageLoad: 3000,      // 3 seconds
  apiResponse: 500,    // 500ms
  searchResponse: 200, // 200ms
};

// Test data
export const testData = {
  validProject: {
    repoUrl: 'https://github.com/doctorcmptrmita2/test-docs',
    name: 'Test Docs',
    slug: 'test-docs-e2e',
    branch: 'main',
    docsPath: '/docs',
  },
  searchQueries: {
    valid: ['getting started', 'installation', 'api'],
    tooShort: ['a', 'b'],
    noResults: ['xyznonexistent123'],
  },
};
