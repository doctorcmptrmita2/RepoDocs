/**
 * Dashboard E2E Tests (Authenticated)
 * 
 * Tests for the authenticated dashboard
 * Requirements: 3.1-3.5, 4.1, 4.5
 */

import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import * as path from 'path';

// Use authenticated state
test.use({ 
  storageState: path.join(__dirname, '../auth/auth-state.json')
});

test.describe('Dashboard (Authenticated)', () => {
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
  });

  /**
   * Requirement 3.1: Dashboard loads with user menu and projects list
   */
  test('should load dashboard with projects', async ({ page }) => {
    await dashboardPage.navigate();
    
    // Verify we're on dashboard (not redirected to login)
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Verify projects heading
    await expect(dashboardPage.projectsHeading).toBeVisible();
  });

  /**
   * Requirement 3.4: New Project button navigation
   */
  test('should have New Project button', async ({ page }) => {
    await dashboardPage.navigate();
    
    // Verify New Project button exists
    expect(await dashboardPage.hasNewProjectButton()).toBe(true);
  });

  /**
   * Requirement 3.4: Navigate to new project page
   */
  test('should navigate to new project page', async ({ page }) => {
    await dashboardPage.navigate();
    await dashboardPage.clickNewProject();
    
    // Verify navigation to new project page
    await expect(page).toHaveURL(/\/dashboard\/new/);
  });

  /**
   * Requirement 4.1: New project form displays
   */
  test('should display new project form', async ({ page }) => {
    await page.goto('/dashboard/new');
    
    // Verify form elements exist
    await expect(page.locator('input[name="repoUrl"], input[placeholder*="github"]')).toBeVisible();
  });

  /**
   * Requirement 3.3: Projects display with info
   */
  test('should display project information', async ({ page }) => {
    await dashboardPage.navigate();
    
    const projectCount = await dashboardPage.getProjectCount();
    
    if (projectCount > 0) {
      const projects = await dashboardPage.getProjects();
      
      // Verify first project has name
      expect(projects[0].name).toBeTruthy();
    }
  });

  /**
   * Requirement 3.5: Project settings navigation
   */
  test('should have project action buttons', async ({ page }) => {
    await dashboardPage.navigate();
    
    const projectCount = await dashboardPage.getProjectCount();
    
    if (projectCount > 0) {
      // Verify View and Settings buttons exist
      const viewButton = page.locator('text=View').first();
      const settingsButton = page.locator('text=Settings').first();
      
      // At least one should be visible
      const hasView = await viewButton.isVisible().catch(() => false);
      const hasSettings = await settingsButton.isVisible().catch(() => false);
      
      expect(hasView || hasSettings).toBe(true);
    }
  });

  /**
   * Requirement 4.5: Project settings page displays all sections
   */
  test('should display project settings page', async ({ page }) => {
    await dashboardPage.navigate();
    
    const projectCount = await dashboardPage.getProjectCount();
    
    if (projectCount > 0) {
      // Click settings on first project
      const settingsLink = page.locator('a:has-text("Settings")').first();
      
      if (await settingsLink.isVisible()) {
        await settingsLink.click();
        await page.waitForLoadState('domcontentloaded');
        
        // Verify we're on settings page
        await expect(page).toHaveURL(/\/settings/);
      }
    }
  });

  /**
   * Additional: Dashboard page title
   */
  test('should have correct page title', async ({ page }) => {
    await dashboardPage.navigate();
    
    const title = await page.title();
    expect(title).toContain('RepoDocs');
  });

  /**
   * Additional: Dashboard responsive
   */
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await dashboardPage.navigate();
    
    // Verify projects heading still visible
    await expect(dashboardPage.projectsHeading).toBeVisible();
  });
});
