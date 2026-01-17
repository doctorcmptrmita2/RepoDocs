/**
 * Homepage E2E Tests
 * 
 * Tests for the public homepage and landing page
 * Requirements: 1.1-1.7
 */

import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { performanceValidator } from '../utils/performance';

test.describe('Homepage', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  /**
   * Requirement 1.1: Homepage loads with HTTP 200 within 3 seconds
   */
  test('should load homepage successfully', async ({ page }) => {
    const response = await page.goto('/');
    
    // Verify HTTP 200
    expect(response?.status()).toBe(200);
    
    // Verify page loaded
    await expect(page).toHaveTitle(/RepoDocs/);
  });

  /**
   * Requirement 1.1: Page load performance
   * Note: First load may be slower due to cold start, using 5s threshold
   */
  test('should load within acceptable time', async ({ page }) => {
    await homePage.navigate();
    
    const metrics = await performanceValidator.measurePageLoad(page);
    
    // Assert load time under 5 seconds (allowing for cold start)
    expect(metrics.loadTime).toBeLessThan(5000);
  });

  /**
   * Requirement 1.2: Header contains navigation links
   */
  test('should display header with navigation links', async ({ page }) => {
    await homePage.navigate();
    
    // Verify header is visible
    expect(await homePage.hasHeader()).toBe(true);
    
    // Verify navigation links
    const navLinks = await homePage.getNavLinks();
    expect(navLinks).toContain('Features');
    expect(navLinks).toContain('Pricing');
    expect(navLinks).toContain('Docs');
  });

  /**
   * Requirement 1.3: Hero section displays with "Git to Docs" heading
   */
  test('should display hero section with correct heading', async ({ page }) => {
    await homePage.navigate();
    
    const heading = await homePage.getHeroHeading();
    expect(heading).toContain('Git to Docs');
  });

  /**
   * Requirement 1.4: Features section contains at least 6 feature cards
   */
  test('should display features section with 6+ cards', async ({ page }) => {
    await homePage.navigate();
    
    // Verify features section exists
    expect(await homePage.hasFeaturesSection()).toBe(true);
    
    // Verify at least 6 feature cards
    const featureCards = await homePage.getFeatureCards();
    expect(featureCards.length).toBeGreaterThanOrEqual(6);
  });

  /**
   * Requirement 1.5: Pricing section displays Hobby, Pro, and Team plans
   */
  test('should display pricing section with all plans', async ({ page }) => {
    await homePage.navigate();
    
    // Verify pricing section exists
    expect(await homePage.hasPricingSection()).toBe(true);
    
    // Verify pricing plans
    const plans = await homePage.getPricingPlans();
    const planNames = plans.map(p => p.name);
    
    expect(planNames).toContain('Hobby');
    expect(planNames).toContain('Pro');
    expect(planNames).toContain('Team');
  });

  /**
   * Requirement 1.6: "Get Started Free" navigates to login
   */
  test('should navigate to login when clicking Get Started', async ({ page }) => {
    await homePage.navigate();
    await homePage.clickGetStarted();
    
    // Verify navigation to login page
    await expect(page).toHaveURL(/\/login/);
  });

  /**
   * Requirement 1.7: "View Demo Docs" navigates to /docs/repodocs/main
   */
  test('should navigate to demo docs when clicking View Demo Docs', async ({ page }) => {
    await homePage.navigate();
    await homePage.clickViewDocs();
    
    // Verify navigation to docs page
    await expect(page).toHaveURL(/\/docs\/repodocs\/main/);
  });

  /**
   * Additional: Verify responsive design
   */
  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await homePage.navigate();
    
    // Verify page still loads
    const heading = await homePage.getHeroHeading();
    expect(heading).toContain('Git to Docs');
  });

  /**
   * Additional: Verify footer links
   */
  test('should display footer with links', async ({ page }) => {
    await homePage.navigate();
    
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // Verify footer contains expected links (use exact match)
    await expect(footer.getByRole('link', { name: 'Docs', exact: true })).toBeVisible();
    await expect(footer.getByRole('link', { name: 'Pricing' })).toBeVisible();
  });
});
