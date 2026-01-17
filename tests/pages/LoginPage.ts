/**
 * LoginPage Page Object
 * 
 * Encapsulates interactions with the login page
 */

import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  
  // Locators
  readonly githubButton: Locator;
  readonly welcomeHeading: Locator;
  readonly description: Locator;

  constructor(page: Page) {
    this.page = page;
    
    this.githubButton = page.locator('button:has-text("Continue with GitHub")');
    this.welcomeHeading = page.locator('h1:has-text("Welcome")');
    this.description = page.locator('text=Sign in to manage your documentation');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/login');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async isGitHubButtonVisible(): Promise<boolean> {
    return await this.githubButton.isVisible();
  }

  async clickGitHubSignIn(): Promise<void> {
    await this.githubButton.click();
    // Wait for redirect to GitHub (login page or OAuth page)
    await this.page.waitForURL(/github\.com/);
  }

  async hasWelcomeHeading(): Promise<boolean> {
    return await this.welcomeHeading.isVisible();
  }

  async hasDescription(): Promise<boolean> {
    return await this.description.isVisible();
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }
}
