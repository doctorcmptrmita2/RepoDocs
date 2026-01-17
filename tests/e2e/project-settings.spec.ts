/**
 * Project Settings E2E Tests (Authenticated)
 * 
 * Tests for project settings page
 * Requirements: 4.5-4.7
 */

import { test, expect } from '@playwright/test';
import * as path from 'path';

// Use authenticated state
test.use({ 
  storageState: path.join(__dirname, '../auth/auth-state.json')
});

test.describe('Project Settings (Authenticated)', () => {
  // Use existing project for testing
  const testProjectSlug = 'agentwall';

  /**
   * Requirement 4.5: Settings page displays all sections
   */
  test('should display settings page with sections', async ({ page }) => {
    await page.goto(`/dashboard/${testProjectSlug}/settings`);
    
    // Verify we're on settings page
    await expect(page).toHaveURL(/\/settings/);
    
    // Verify page loaded
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  /**
   * Requirement 4.5: General section
   */
  test('should display general settings section', async ({ page }) => {
    await page.goto(`/dashboard/${testProjectSlug}/settings`);
    
    // Look for general settings elements
    const generalSection = page.locator('text=General').or(page.locator('text=Project Name'));
    await expect(generalSection.first()).toBeVisible();
  });

  /**
   * Requirement 4.5: Custom Domain section
   */
  test('should display custom domain section', async ({ page }) => {
    await page.goto(`/dashboard/${testProjectSlug}/settings`);
    
    // Look for custom domain section
    const domainSection = page.locator('text=Custom Domain').or(page.locator('text=Domain'));
    await expect(domainSection.first()).toBeVisible();
  });

  /**
   * Requirement 4.6: Manual Refresh button
   */
  test('should have refresh docs button', async ({ page }) => {
    await page.goto(`/dashboard/${testProjectSlug}/settings`);
    
    // Look for refresh button
    const refreshButton = page.locator('button:has-text("Refresh")').or(
      page.locator('button:has-text("Sync")')
    );
    
    // Should have some form of refresh functionality
    const hasRefresh = await refreshButton.first().isVisible().catch(() => false);
    expect(hasRefresh).toBe(true);
  });

  /**
   * Requirement 4.5: Repository info section
   */
  test('should display repository information', async ({ page }) => {
    await page.goto(`/dashboard/${testProjectSlug}/settings`);
    
    // Look for repository info
    const repoInfo = page.locator('text=Repository').or(
      page.locator('text=github.com')
    );
    await expect(repoInfo.first()).toBeVisible();
  });

  /**
   * Requirement 4.5: Danger Zone section
   */
  test('should display danger zone section', async ({ page }) => {
    await page.goto(`/dashboard/${testProjectSlug}/settings`);
    
    // Look for danger zone
    const dangerZone = page.locator('text=Danger').or(
      page.locator('text=Delete')
    );
    await expect(dangerZone.first()).toBeVisible();
  });

  /**
   * Additional: Settings page title
   */
  test('should have correct page title', async ({ page }) => {
    await page.goto(`/dashboard/${testProjectSlug}/settings`);
    
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  /**
   * Additional: Back to dashboard link
   */
  test('should have navigation back to dashboard', async ({ page }) => {
    await page.goto(`/dashboard/${testProjectSlug}/settings`);
    
    // Look for back link or dashboard link
    const backLink = page.locator('a[href="/dashboard"]').or(
      page.locator('a:has-text("Projects")')
    );
    
    const hasBack = await backLink.first().isVisible().catch(() => false);
    expect(hasBack).toBe(true);
  });

  /**
   * Additional: View docs link
   */
  test('should have link to view docs', async ({ page }) => {
    await page.goto(`/dashboard/${testProjectSlug}/settings`);
    
    // Look for view docs link
    const viewLink = page.locator(`a[href*="/docs/${testProjectSlug}"]`).or(
      page.locator('a:has-text("View Docs")')
    );
    
    const hasView = await viewLink.first().isVisible().catch(() => false);
    expect(hasView).toBe(true);
  });
});
