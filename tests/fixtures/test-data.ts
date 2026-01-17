/**
 * Test Fixtures and Data Generators
 * 
 * Reusable test data for all test types
 */

import * as fc from 'fast-check';

// ==================== STATIC FIXTURES ====================

export const validProjectData = {
  repoUrl: 'https://github.com/doctorcmptrmita2/test-docs',
  name: 'Test Documentation',
  slug: 'test-docs-e2e',
  branch: 'main',
  docsPath: '/docs',
};

export const invalidProjectData = {
  duplicateSlug: {
    ...validProjectData,
    slug: 'repodocs', // Already exists
  },
  invalidUrl: {
    ...validProjectData,
    repoUrl: 'not-a-valid-url',
  },
  emptyName: {
    ...validProjectData,
    name: '',
  },
  invalidSlug: {
    ...validProjectData,
    slug: 'Invalid Slug With Spaces!',
  },
};

export const searchQueries = {
  valid: ['getting started', 'installation', 'api', 'configuration'],
  tooShort: ['a', 'b', ''],
  noResults: ['xyznonexistent123456', 'qwertyuiopasdfghjkl'],
};

export const testProjects = {
  demo: {
    slug: 'repodocs',
    version: 'main',
  },
};

// ==================== FAST-CHECK ARBITRARIES ====================

/**
 * Generate valid GitHub URLs
 */
export const validGitHubUrl = fc.tuple(
  fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'.split('')), { minLength: 1, maxLength: 20 }),
  fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-_'.split('')), { minLength: 1, maxLength: 30 })
).map(([owner, repo]) => `https://github.com/${owner}/${repo}`);

/**
 * Generate invalid GitHub URLs
 */
export const invalidGitHubUrl = fc.oneof(
  fc.constant('not-a-url'),
  fc.constant('http://example.com/repo'),
  fc.constant('https://gitlab.com/owner/repo'),
  fc.constant('github.com/missing-protocol'),
  fc.webUrl().filter(url => !url.includes('github.com')),
);

/**
 * Generate valid project slugs
 */
export const validSlug = fc.stringOf(
  fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'.split('')),
  { minLength: 3, maxLength: 30 }
).filter(s => !s.startsWith('-') && !s.endsWith('-'));

/**
 * Generate invalid project slugs
 */
export const invalidSlug = fc.oneof(
  fc.constant(''),
  fc.constant('a'), // Too short
  fc.stringOf(fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')), { minLength: 3 }), // Uppercase
  fc.constant('slug with spaces'),
  fc.constant('slug_with_underscores'),
  fc.constant('slug.with.dots'),
);

/**
 * Generate valid search queries (2+ characters)
 */
export const validSearchQuery = fc.string({ minLength: 2, maxLength: 50 })
  .filter(s => s.trim().length >= 2);

/**
 * Generate short search queries (< 2 characters)
 */
export const shortSearchQuery = fc.string({ minLength: 0, maxLength: 1 });

/**
 * Generate random page paths for 404 testing
 */
export const nonExistentPath = fc.tuple(
  fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'.split('')), { minLength: 5, maxLength: 20 }),
  fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'.split('')), { minLength: 5, maxLength: 20 })
).map(([a, b]) => `/${a}/${b}/nonexistent-${Date.now()}`);

/**
 * Generate protected routes
 */
export const protectedRoutes = fc.constantFrom(
  '/dashboard',
  '/dashboard/new',
  '/dashboard/test-project/settings',
);

/**
 * Generate public routes
 */
export const publicRoutes = fc.constantFrom(
  '/',
  '/login',
  '/docs/repodocs/main',
);

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate unique test slug
 */
export function generateUniqueSlug(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Generate webhook signature
 */
export function generateWebhookSignature(payload: string, secret: string): string {
  const crypto = require('crypto');
  return `sha256=${crypto.createHmac('sha256', secret).update(payload).digest('hex')}`;
}

/**
 * Generate invalid webhook signature
 */
export function generateInvalidSignature(): string {
  return `sha256=${Array(64).fill('0').join('')}`;
}
