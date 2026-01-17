/**
 * Performance Test Utilities
 * 
 * Timing measurement and validation utilities
 */

import type { Page } from '@playwright/test';
import { performanceThresholds } from '../config/test.config';

export interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
}

export class PerformanceValidator {
  /**
   * Measure page load performance
   */
  async measurePageLoad(page: Page): Promise<PerformanceMetrics> {
    const timing = await page.evaluate(() => {
      const perf = window.performance;
      const navigation = perf.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      // Get paint metrics
      const paintEntries = perf.getEntriesByType('paint');
      const fcp = paintEntries.find(e => e.name === 'first-contentful-paint');
      
      return {
        loadTime: navigation.loadEventEnd - navigation.startTime,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.startTime,
        firstContentfulPaint: fcp?.startTime,
      };
    });

    return timing;
  }

  /**
   * Assert page load time is within threshold
   */
  assertPageLoadTime(metrics: PerformanceMetrics, maxMs?: number): void {
    const threshold = maxMs || performanceThresholds.pageLoad;
    if (metrics.loadTime > threshold) {
      throw new Error(
        `Page load time ${metrics.loadTime.toFixed(0)}ms exceeds threshold ${threshold}ms`
      );
    }
  }

  /**
   * Assert API response time is within threshold
   */
  assertApiResponseTime(responseTime: number, maxMs?: number): void {
    const threshold = maxMs || performanceThresholds.apiResponse;
    if (responseTime > threshold) {
      throw new Error(
        `API response time ${responseTime.toFixed(0)}ms exceeds threshold ${threshold}ms`
      );
    }
  }

  /**
   * Assert search API response time is within threshold
   */
  assertSearchResponseTime(responseTime: number): void {
    const threshold = performanceThresholds.searchResponse;
    if (responseTime > threshold) {
      throw new Error(
        `Search response time ${responseTime.toFixed(0)}ms exceeds threshold ${threshold}ms`
      );
    }
  }

  /**
   * Measure multiple page loads and return average
   */
  async measureAverageLoadTime(
    page: Page, 
    url: string, 
    iterations: number = 3
  ): Promise<number> {
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      await page.goto(url, { waitUntil: 'load' });
      const metrics = await this.measurePageLoad(page);
      times.push(metrics.loadTime);
    }
    
    return times.reduce((a, b) => a + b, 0) / times.length;
  }
}

export const performanceValidator = new PerformanceValidator();

/**
 * Simple timing utility for API calls
 */
export async function measureTime<T>(
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  return { result, duration };
}
