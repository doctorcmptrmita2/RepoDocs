/**
 * DocsPage Page Object
 * 
 * Encapsulates interactions with the documentation viewer
 */

import { Page, Locator } from '@playwright/test';
import type { NavItem, Heading, SearchResult } from '../types';

export class DocsPage {
  readonly page: Page;
  
  // Locators
  readonly sidebar: Locator;
  readonly sidebarItems: Locator;
  readonly mainContent: Locator;
  readonly tableOfContents: Locator;
  readonly tocItems: Locator;
  readonly articleTitle: Locator;
  readonly articleContent: Locator;
  readonly codeBlocks: Locator;
  readonly searchDialog: Locator;
  readonly searchInput: Locator;
  readonly searchResults: Locator;
  readonly versionSelector: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Sidebar
    this.sidebar = page.locator('aside').first();
    this.sidebarItems = page.locator('aside a, aside [role="link"]');
    
    // Main content
    this.mainContent = page.locator('main, article').first();
    this.articleTitle = page.locator('article h1, main h1').first();
    this.articleContent = page.locator('article, .prose').first();
    this.codeBlocks = page.locator('pre code, .shiki');
    
    // Table of contents
    this.tableOfContents = page.locator('[data-testid="toc"]').or(page.locator('nav:has(a[href^="#"])').last());
    this.tocItems = page.locator('[data-testid="toc"] a').or(page.locator('nav a[href^="#"]'));
    
    // Search
    this.searchDialog = page.locator('[role="dialog"]').or(page.locator('[data-testid="search-dialog"]'));
    this.searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');
    this.searchResults = page.locator('[data-testid="search-results"] a').or(page.locator('[role="listbox"] [role="option"]'));
    
    // Version selector
    this.versionSelector = page.locator('[data-testid="version-selector"]').or(page.locator('select'));
  }

  async navigate(project: string, version: string, slug?: string): Promise<void> {
    const path = slug 
      ? `/docs/${project}/${version}/${slug}`
      : `/docs/${project}/${version}`;
    await this.page.goto(path);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getSidebarItems(): Promise<NavItem[]> {
    const items = await this.sidebarItems.all();
    const navItems: NavItem[] = [];
    
    for (const item of items) {
      const title = await item.textContent() || '';
      const href = await item.getAttribute('href') || '';
      
      if (title.trim()) {
        navItems.push({
          title: title.trim(),
          slug: href.split('/').pop() || '',
          path: href,
        });
      }
    }
    
    return navItems;
  }

  async getTableOfContents(): Promise<Heading[]> {
    const items = await this.tocItems.all();
    const headings: Heading[] = [];
    
    for (const item of items) {
      const text = await item.textContent() || '';
      const href = await item.getAttribute('href') || '';
      
      if (text.trim()) {
        headings.push({
          id: href.replace('#', ''),
          text: text.trim(),
          level: 2, // Default level
        });
      }
    }
    
    return headings;
  }

  async getContent(): Promise<string> {
    return await this.articleContent.textContent() || '';
  }

  async getTitle(): Promise<string> {
    return await this.articleTitle.textContent() || '';
  }

  async openSearch(): Promise<void> {
    // Try keyboard shortcut first
    await this.page.keyboard.press('Control+k');
    
    // Wait for search dialog
    try {
      await this.searchDialog.waitFor({ state: 'visible', timeout: 2000 });
    } catch {
      // Try clicking search button if keyboard shortcut didn't work
      const searchButton = this.page.locator('button:has-text("Search")').or(
        this.page.locator('[data-testid="search-button"]')
      );
      if (await searchButton.isVisible()) {
        await searchButton.click();
      }
    }
  }

  async search(query: string): Promise<SearchResult[]> {
    await this.openSearch();
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(500); // Wait for search results
    
    const results = await this.searchResults.all();
    const searchResults: SearchResult[] = [];
    
    for (const result of results) {
      const title = await result.locator('.font-medium, h4').textContent() || '';
      const snippet = await result.locator('.text-sm, p').textContent() || '';
      const href = await result.getAttribute('href') || '';
      
      searchResults.push({
        title: title.trim(),
        slug: href.split('/').pop() || '',
        path: href,
        snippet: snippet.trim(),
      });
    }
    
    return searchResults;
  }

  async clickSidebarItem(title: string): Promise<void> {
    const item = this.page.locator(`aside a:has-text("${title}")`);
    await item.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async clickTocItem(text: string): Promise<void> {
    const item = this.page.locator(`nav a:has-text("${text}")`);
    await item.click();
  }

  async hasSidebar(): Promise<boolean> {
    return await this.sidebar.isVisible();
  }

  async hasTableOfContents(): Promise<boolean> {
    return await this.tableOfContents.isVisible();
  }

  async hasCodeBlocks(): Promise<boolean> {
    const blocks = await this.codeBlocks.all();
    return blocks.length > 0;
  }

  async getCodeBlockCount(): Promise<number> {
    const blocks = await this.codeBlocks.all();
    return blocks.length;
  }

  async hasShikiHighlighting(): Promise<boolean> {
    // Check if code blocks have Shiki classes
    const shikiBlocks = await this.page.locator('.shiki, [data-language]').all();
    return shikiBlocks.length > 0;
  }

  async closeSearch(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }
}
