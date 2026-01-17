# Implementation Plan: Production Testing for RepoDocs

## Overview

This implementation plan creates a comprehensive production test suite for RepoDocs using Playwright for E2E testing, Vitest as the test runner, and fast-check for property-based testing. The tests will validate all critical functionality against the production environment at https://repodocs.dev.

## Tasks

- [x] 1. Set up test infrastructure and configuration
  - [x] 1.1 Initialize test project structure with Playwright and Vitest
    - Install dependencies: playwright, @playwright/test, vitest, fast-check
    - Create tests/ directory structure with e2e/, api/, properties/, pages/, utils/, fixtures/, config/
    - Configure playwright.config.ts for production testing
    - Configure vitest.config.ts for API and property tests
    - _Requirements: All_

  - [x] 1.2 Create test configuration and utilities
    - Create tests/config/test.config.ts with base URL, timeouts, retries
    - Create tests/utils/api.ts with ApiClient class for HTTP requests
    - Create tests/utils/performance.ts with timing measurement utilities
    - Create tests/utils/error-handling.ts with failure capture utilities
    - _Requirements: 8.1-8.5, 9.1-9.3_

- [x] 2. Implement Page Object Models
  - [x] 2.1 Create HomePage page object
    - Implement navigate(), getHeroHeading(), getFeatureCards(), getPricingPlans()
    - Implement clickGetStarted(), clickViewDocs() navigation methods
    - _Requirements: 1.1-1.7_

  - [x] 2.2 Create LoginPage page object
    - Implement navigate(), isGitHubButtonVisible(), clickGitHubSignIn()
    - _Requirements: 2.1-2.2_

  - [x] 2.3 Create DashboardPage page object
    - Implement navigate(), getProjects(), isEmptyState()
    - Implement clickNewProject(), clickProjectSettings()
    - _Requirements: 3.1-3.5_

  - [x] 2.4 Create DocsPage page object
    - Implement navigate(), getSidebarItems(), getTableOfContents(), getContent()
    - Implement openSearch(), search() methods
    - _Requirements: 5.1-5.8_

- [x] 3. Implement Homepage and Public Pages Tests
  - [x] 3.1 Create homepage E2E tests
    - Test homepage loads with HTTP 200
    - Test header navigation links presence
    - Test hero section with "Git to Docs" heading
    - Test features section with 6+ feature cards
    - Test pricing section with Hobby, Pro, Team plans
    - Test "Get Started Free" navigation to login
    - Test "View Demo Docs" navigation to /docs/repodocs/main
    - _Requirements: 1.1-1.7_

  - [ ]* 3.2 Write property test for page load performance
    - **Property 1: Page Load Performance**
    - **Validates: Requirements 8.1, 8.2, 8.3**

- [x] 4. Implement Authentication Flow Tests
  - [x] 4.1 Create authentication E2E tests
    - Test login page loads with GitHub sign-in button
    - Test GitHub OAuth redirect initiation
    - Test unauthenticated dashboard redirect to login
    - _Requirements: 2.1-2.4_

  - [ ]* 4.2 Write property test for authentication guard
    - **Property 2: Authentication Guard Redirect**
    - **Validates: Requirements 2.4**

- [x] 5. Checkpoint - Verify public pages and auth tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement Dashboard Tests
  - [x] 6.1 Create dashboard E2E tests
    - Test dashboard loads with user menu and projects list
    - Test empty state displays with "New Project" button
    - Test project row displays name, repo, branch, actions
    - Test "New Project" navigation
    - Test project settings navigation
    - _Requirements: 3.1-3.5_

  - [ ]* 6.2 Write property test for project display completeness
    - **Property 3: Project Display Completeness**
    - **Validates: Requirements 3.3**

- [x] 7. Implement Project Management Tests
  - [x] 7.1 Create project management E2E tests
    - Test new project form displays all required fields
    - Test project settings page displays all sections
    - _Requirements: 4.1, 4.5_

  - [ ]* 7.2 Write property test for invalid URL rejection
    - **Property 4: Invalid URL Rejection**
    - **Validates: Requirements 4.4**

- [x] 8. Implement Documentation Viewer Tests
  - [x] 8.1 Create docs viewer E2E tests
    - Test docs page loads with sidebar, content, TOC
    - Test sidebar displays navigation items
    - Test TOC displays document headings
    - Test sidebar navigation works
    - Test TOC anchor scrolling works
    - Test code blocks have syntax highlighting
    - Test Cmd/Ctrl+K opens search dialog
    - Test search returns matching results
    - _Requirements: 5.1-5.8_

  - [ ]* 8.2 Write property test for docs page structure
    - **Property 5: Docs Page Structure**
    - **Validates: Requirements 5.1**

  - [ ]* 8.3 Write property test for TOC heading reflection
    - **Property 6: Table of Contents Heading Reflection**
    - **Validates: Requirements 5.3**

  - [ ]* 8.4 Write property test for sidebar navigation
    - **Property 7: Sidebar Navigation**
    - **Validates: Requirements 5.4**

  - [ ]* 8.5 Write property test for code block syntax highlighting
    - **Property 9: Code Block Syntax Highlighting**
    - **Validates: Requirements 5.6**

  - [ ]* 8.6 Write property test for search results relevance
    - **Property 10: Search Results Relevance**
    - **Validates: Requirements 5.8**

- [x] 9. Checkpoint - Verify dashboard and docs tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement Custom Domain Tests
  - [ ] 10.1 Create custom domain routing tests
    - Test subdomain routing rewrites correctly
    - _Requirements: 6.1, 6.3_

  - [ ]* 10.2 Write property test for subdomain routing
    - **Property 11: Subdomain Routing**
    - **Validates: Requirements 6.3**

- [x] 11. Implement API Endpoint Tests
  - [x] 11.1 Create health API tests
    - Test GET /api/health returns correct structure
    - Test healthy status returns HTTP 200
    - Test unhealthy status returns HTTP 503
    - _Requirements: 7.1-7.3_

  - [ ]* 11.2 Write property test for health check response structure
    - **Property 12: Health Check Response Structure**
    - **Validates: Requirements 7.1**

  - [x] 11.3 Create search API tests
    - Test search with valid query returns results
    - Test search with short query returns empty
    - _Requirements: 7.4-7.5_

  - [ ]* 11.4 Write property test for search API response structure
    - **Property 13: Search API Response Structure**
    - **Validates: Requirements 7.4**

  - [ ]* 11.5 Write property test for short query empty results
    - **Property 14: Short Query Empty Results**
    - **Validates: Requirements 7.5**

  - [x] 11.6 Create projects API tests
    - Test POST /api/projects without auth returns 401
    - _Requirements: 7.6_

  - [x] 11.7 Create webhook API tests
    - Test webhook with invalid signature returns 401
    - _Requirements: 7.8_

  - [ ]* 11.8 Write property test for webhook signature validation
    - **Property 15: Webhook Signature Validation**
    - **Validates: Requirements 7.8**

- [ ] 12. Implement Performance Tests
  - [ ] 12.1 Create performance measurement tests
    - Test homepage loads within 3 seconds
    - Test dashboard loads within 3 seconds
    - Test docs pages load within 3 seconds
    - Test API endpoints respond within 500ms
    - Test search API responds within 200ms
    - _Requirements: 8.1-8.5_

  - [ ]* 12.2 Write property test for API response time
    - **Property 16: API Response Time**
    - **Validates: Requirements 8.4**

  - [ ]* 12.3 Write property test for search API response time
    - **Property 17: Search API Response Time**
    - **Validates: Requirements 8.5**

- [ ] 13. Checkpoint - Verify API and performance tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Implement Error Handling Tests
  - [ ] 14.1 Create 404 error handling tests
    - Test non-existent page returns 404
    - Test non-existent project docs returns 404
    - _Requirements: 9.1-9.2_

  - [ ]* 14.2 Write property test for 404 error handling
    - **Property 18: 404 Error Handling**
    - **Validates: Requirements 9.1, 9.2**

  - [ ]* 14.3 Write property test for API error response format
    - **Property 19: API Error Response Format**
    - **Validates: Requirements 9.3**

- [ ] 15. Implement SEO and Metadata Tests
  - [ ] 15.1 Create SEO tests
    - Test docs pages have title, description, OG tags
    - Test /robots.txt returns valid content
    - Test /sitemap.xml returns valid XML
    - _Requirements: 10.1-10.3_

  - [ ]* 15.2 Write property test for SEO metadata presence
    - **Property 20: SEO Metadata Presence**
    - **Validates: Requirements 10.1**

- [ ] 16. Create test fixtures and data generators
  - [ ] 16.1 Create test fixtures
    - Create valid project data fixtures
    - Create invalid project data fixtures
    - Create search query fixtures
    - Create URL generators for property tests
    - _Requirements: All_

- [ ] 17. Set up CI/CD integration
  - [ ] 17.1 Create GitHub Actions workflow
    - Create .github/workflows/production-tests.yml
    - Configure scheduled runs every 6 hours
    - Configure manual trigger support
    - Set up artifact upload for test results
    - _Requirements: All_

- [ ] 18. Final checkpoint - Run complete test suite
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples and edge cases
- Tests target production environment at https://repodocs.dev
