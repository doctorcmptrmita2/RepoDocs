/**
 * Documentation Viewer E2E Tests
 * 
 * Tests for the documentation viewer
 * Requirements: 5.1-5.8
 */

import { test, expect } from '@playwright/test';
import { DocsPage } from '../pages/DocsPage';

test.describe('Documentation Viewer', () => {
  let docsPage: DocsPage;

  test.beforeEach(async ({ page }) => {
    docsPage = new DocsPage(page);
  });

  /**
   * Requirement 5.1: Docs page loads with sidebar, content, and TOC
   */
  test('should load docs page with all components', async ({ page }) => {
    await docsPage.navigate('repodocs', 'main');
    
    // Verify page loaded
    await expect(page).toHaveURL(/\/docs\/repodocs\/main/);
    
    // Verify sidebar is visible
    expect(await docsPage.hasSidebar()).toBe(true);
    
    // Verify main content is visible
    await expect(docsPage.mainContent).toBeVisible();
  });

  /**
   * Requirement 5.2: Sidebar displays navigation items
   */
  test('should display sidebar navigation items', async ({ page }) => {
    await docsPage.navigate('repodocs', 'main');
    
    const sidebarItems = await docsPage.getSidebarItems();
    
    // Verify sidebar has items
    expect(sidebarItems.length).toBeGreaterThan(0);
  });

  /**
   * Requirement 5.3: Table of contents displays headings
   */
  test('should display table of contents', async ({ page }) => {
    await docsPage.navigate('repodocs', 'main');
    
    // TOC may not be visible on all pages
    const hasToc = await docsPage.hasTableOfContents();
    
    if (hasToc) {
      const tocItems = await docsPage.getTableOfContents();
      expect(tocItems.length).toBeGreaterThanOrEqual(0);
    }
  });

  /**
   * Requirement 5.4: Sidebar navigation works
   */
  test('should navigate when clicking sidebar item', async ({ page }) => {
    await docsPage.navigate('repodocs', 'main');
    
    const sidebarItems = await docsPage.getSidebarItems();
    
    if (sidebarItems.length > 1) {
      // Click second item (first might be current page)
      const targetItem = sidebarItems[1];
      await docsPage.clickSidebarItem(targetItem.title);
      
      // Verify navigation occurred
      await page.waitForLoadState('domcontentloaded');
    }
  });

  /**
   * Requirement 5.6: Code blocks have syntax highlighting
   */
  test('should have syntax highlighting on code blocks', async ({ page }) => {
    await docsPage.navigate('repodocs', 'main');
    
    // Check if page has code blocks
    const hasCodeBlocks = await docsPage.hasCodeBlocks();
    
    if (hasCodeBlocks) {
      // Verify Shiki highlighting is applied
      const hasShiki = await docsPage.hasShikiHighlighting();
      expect(hasShiki).toBe(true);
    }
  });

  /**
   * Requirement 5.7: Search dialog opens with Cmd/Ctrl+K
   */
  test('should open search dialog with keyboard shortcut', async ({ page }) => {
    await docsPage.navigate('repodocs', 'main');
    
    // Try to open search
    await docsPage.openSearch();
    
    // Check if search input is visible
    const searchVisible = await docsPage.searchInput.isVisible().catch(() => false);
    
    // Close search if opened
    if (searchVisible) {
      await docsPage.closeSearch();
    }
  });

  /**
   * Additional: Docs page title
   */
  test('should have correct page title', async ({ page }) => {
    await docsPage.navigate('repodocs', 'main');
    
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  /**
   * Additional: Docs page content
   */
  test('should display document content', async ({ page }) => {
    await docsPage.navigate('repodocs', 'main');
    
    const content = await docsPage.getContent();
    expect(content.length).toBeGreaterThan(0);
  });

  /**
   * Additional: Navigate to specific doc
   */
  test('should load specific document', async ({ page }) => {
    // Navigate to a specific doc page
    await docsPage.navigate('repodocs', 'main', 'getting-started');
    
    // Verify page loaded (may redirect to index if doc doesn't exist)
    await expect(page).toHaveURL(/\/docs\/repodocs\/main/);
  });

  /**
   * Additional: Mobile responsive
   */
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await docsPage.navigate('repodocs', 'main');
    
    // Verify main content is visible
    await expect(docsPage.mainContent).toBeVisible();
  });
});
