/**
 * DashboardPage Page Object
 * 
 * Encapsulates interactions with the dashboard
 */

import { Page, Locator } from '@playwright/test';
import type { Project } from '../types';

export class DashboardPage {
  readonly page: Page;
  
  // Locators
  readonly projectsHeading: Locator;
  readonly projectsList: Locator;
  readonly projectRows: Locator;
  readonly newProjectButton: Locator;
  readonly emptyState: Locator;
  readonly userMenu: Locator;

  constructor(page: Page) {
    this.page = page;
    
    this.projectsHeading = page.locator('h1:has-text("Projects")');
    this.projectsList = page.locator('[data-testid="projects-list"]').or(page.locator('.space-y-4'));
    this.projectRows = page.locator('[data-testid="project-row"]').or(page.locator('.bg-white.rounded-lg.border'));
    this.newProjectButton = page.locator('a:has-text("New Project")').or(page.locator('button:has-text("New Project")'));
    this.emptyState = page.locator('text=No projects yet');
    this.userMenu = page.locator('[data-testid="user-menu"]').or(page.locator('button:has([alt="Avatar"])'));
  }

  async navigate(): Promise<void> {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async isEmptyState(): Promise<boolean> {
    return await this.emptyState.isVisible();
  }

  async getProjects(): Promise<Project[]> {
    const rows = await this.projectRows.all();
    const projects: Project[] = [];
    
    for (const row of rows) {
      const name = await row.locator('h3, .font-semibold').first().textContent() || '';
      const repoText = await row.locator('.text-slate-500, .text-sm').first().textContent() || '';
      
      projects.push({
        id: '',
        name: name.trim(),
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        repoFullName: repoText.trim(),
        branch: 'main',
        docsPath: '/docs',
      });
    }
    
    return projects;
  }

  async clickNewProject(): Promise<void> {
    await this.newProjectButton.click();
    await this.page.waitForURL('**/dashboard/new**');
  }

  async clickProjectSettings(slug: string): Promise<void> {
    const settingsLink = this.page.locator(`a[href*="/dashboard/${slug}/settings"]`).or(
      this.page.locator(`text=Settings`).first()
    );
    await settingsLink.click();
    await this.page.waitForURL(`**/dashboard/${slug}/settings**`);
  }

  async clickProjectView(slug: string): Promise<void> {
    const viewLink = this.page.locator(`a[href*="/docs/${slug}"]`).or(
      this.page.locator(`text=View`).first()
    );
    await viewLink.click();
    await this.page.waitForURL(`**/docs/${slug}/**`);
  }

  async hasUserMenu(): Promise<boolean> {
    return await this.userMenu.isVisible();
  }

  async hasNewProjectButton(): Promise<boolean> {
    return await this.newProjectButton.isVisible();
  }

  async getProjectCount(): Promise<number> {
    const rows = await this.projectRows.all();
    return rows.length;
  }
}
