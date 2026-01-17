/**
 * Authentication E2E Tests
 * 
 * Tests for the authentication flow
 * Requirements: 2.1-2.5
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Authentication', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
  });

  /**
   * Requirement 2.1: Login page loads with GitHub sign-in button
   */
  test('should display login page with GitHub button', async ({ page }) => {
    await loginPage.navigate();
    
    // Verify page loaded
    await expect(page).toHaveURL(/\/login/);
    
    // Verify GitHub button is visible
    expect(await loginPage.isGitHubButtonVisible()).toBe(true);
  });

  /**
   * Requirement 2.1: Login page has welcome heading
   */
  test('should display welcome heading', async ({ page }) => {
    await loginPage.navigate();
    
    expect(await loginPage.hasWelcomeHeading()).toBe(true);
  });

  /**
   * Requirement 2.1: Login page has description
   */
  test('should display sign-in description', async ({ page }) => {
    await loginPage.navigate();
    
    expect(await loginPage.hasDescription()).toBe(true);
  });

  /**
   * Requirement 2.2: GitHub OAuth redirect
   * Note: We can only test the redirect initiation, not the full OAuth flow
   */
  test('should redirect to GitHub OAuth when clicking sign in', async ({ page }) => {
    await loginPage.navigate();
    
    // Click GitHub sign in
    await loginPage.clickGitHubSignIn();
    
    // Verify redirect to GitHub
    await expect(page).toHaveURL(/github\.com/);
  });

  /**
   * Requirement 2.4: Unauthenticated dashboard redirect
   */
  test('should redirect to login when accessing dashboard without auth', async ({ page }) => {
    // Try to access dashboard directly
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  /**
   * Requirement 2.4: Unauthenticated new project redirect
   */
  test('should redirect to login when accessing new project without auth', async ({ page }) => {
    // Try to access new project page directly
    await page.goto('/dashboard/new');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  /**
   * Requirement 2.4: Unauthenticated settings redirect
   */
  test('should redirect to login when accessing settings without auth', async ({ page }) => {
    // Try to access settings page directly
    await page.goto('/dashboard/test-project/settings');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  /**
   * Additional: Login page title
   */
  test('should have correct page title', async ({ page }) => {
    await loginPage.navigate();
    
    const title = await loginPage.getPageTitle();
    expect(title).toContain('RepoDocs');
  });

  /**
   * Additional: Login page is accessible
   */
  test('should be accessible from homepage', async ({ page }) => {
    // Start from homepage
    await page.goto('/');
    
    // Click Sign In link
    await page.click('a:has-text("Sign In")');
    
    // Verify navigation to login
    await expect(page).toHaveURL(/\/login/);
  });
});
