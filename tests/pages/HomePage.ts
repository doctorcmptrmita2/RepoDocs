/**
 * HomePage Page Object
 * 
 * Encapsulates interactions with the homepage
 */

import { Page, Locator, expect } from '@playwright/test';
import type { PricingPlan } from '../types';

export class HomePage {
  readonly page: Page;
  
  // Locators
  readonly header: Locator;
  readonly heroHeading: Locator;
  readonly featuresSection: Locator;
  readonly featureCards: Locator;
  readonly pricingSection: Locator;
  readonly pricingCards: Locator;
  readonly getStartedButton: Locator;
  readonly viewDocsLink: Locator;
  readonly navLinks: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Header
    this.header = page.locator('header');
    this.navLinks = page.locator('header nav a');
    
    // Hero section
    this.heroHeading = page.locator('h1');
    this.getStartedButton = page.locator('a:has-text("Connect GitHub")').first();
    this.viewDocsLink = page.locator('a:has-text("View Demo Docs")');
    
    // Features section
    this.featuresSection = page.locator('#features');
    this.featureCards = page.locator('#features .rounded-xl');
    
    // Pricing section
    this.pricingSection = page.locator('#pricing');
    this.pricingCards = page.locator('#pricing .rounded-2xl');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getHeroHeading(): Promise<string> {
    return await this.heroHeading.textContent() || '';
  }

  async getFeatureCards(): Promise<string[]> {
    const cards = await this.featureCards.all();
    const titles: string[] = [];
    
    for (const card of cards) {
      const title = await card.locator('h3').textContent();
      if (title) titles.push(title);
    }
    
    return titles;
  }

  async getPricingPlans(): Promise<PricingPlan[]> {
    const cards = await this.pricingCards.all();
    const plans: PricingPlan[] = [];
    
    for (const card of cards) {
      const name = await card.locator('h3').textContent() || '';
      const price = await card.locator('.text-4xl').textContent() || '';
      const featureItems = await card.locator('li').all();
      const features: string[] = [];
      
      for (const item of featureItems) {
        const text = await item.textContent();
        if (text) features.push(text.trim());
      }
      
      plans.push({ name, price, features });
    }
    
    return plans;
  }

  async clickGetStarted(): Promise<void> {
    await this.getStartedButton.click();
    await this.page.waitForURL('**/login**');
  }

  async clickViewDocs(): Promise<void> {
    await this.viewDocsLink.click();
    await this.page.waitForURL('**/docs/**');
  }

  async getNavLinks(): Promise<string[]> {
    const links = await this.navLinks.all();
    const texts: string[] = [];
    
    for (const link of links) {
      const text = await link.textContent();
      if (text) texts.push(text.trim());
    }
    
    return texts;
  }

  async hasHeader(): Promise<boolean> {
    return await this.header.isVisible();
  }

  async hasFeaturesSection(): Promise<boolean> {
    return await this.featuresSection.isVisible();
  }

  async hasPricingSection(): Promise<boolean> {
    return await this.pricingSection.isVisible();
  }

  async scrollToFeatures(): Promise<void> {
    await this.featuresSection.scrollIntoViewIfNeeded();
  }

  async scrollToPricing(): Promise<void> {
    await this.pricingSection.scrollIntoViewIfNeeded();
  }
}
