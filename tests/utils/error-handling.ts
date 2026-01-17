/**
 * Error Handling Utilities
 * 
 * Capture and report test failures with context
 */

import type { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export interface TestError {
  testName: string;
  error: Error;
  screenshot?: string;
  url?: string;
  timestamp: string;
}

export interface NetworkLog {
  url: string;
  method: string;
  status?: number;
  responseTime?: number;
}

export class TestErrorHandler {
  private screenshotDir: string;

  constructor(screenshotDir: string = 'test-results/screenshots') {
    this.screenshotDir = screenshotDir;
    this.ensureDir(screenshotDir);
  }

  private ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Capture failure context including screenshot
   */
  async captureFailure(
    page: Page, 
    testName: string, 
    error: Error
  ): Promise<TestError> {
    const timestamp = new Date().toISOString();
    const safeName = testName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const screenshotPath = path.join(
      this.screenshotDir, 
      `${safeName}-${Date.now()}.png`
    );

    let screenshot: string | undefined;
    
    try {
      await page.screenshot({ path: screenshotPath, fullPage: true });
      screenshot = screenshotPath;
    } catch (e) {
      console.warn('Failed to capture screenshot:', e);
    }

    return {
      testName,
      error,
      screenshot,
      url: page.url(),
      timestamp,
    };
  }

  /**
   * Log test error with context
   */
  logError(testError: TestError): void {
    console.error('\n=== Test Failure ===');
    console.error(`Test: ${testError.testName}`);
    console.error(`URL: ${testError.url}`);
    console.error(`Time: ${testError.timestamp}`);
    console.error(`Error: ${testError.error.message}`);
    if (testError.screenshot) {
      console.error(`Screenshot: ${testError.screenshot}`);
    }
    console.error('====================\n');
  }
}

export const errorHandler = new TestErrorHandler();

/**
 * Retry utility for flaky operations
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: { retries?: number; delay?: number } = {}
): Promise<T> {
  const { retries = 3, delay = 1000 } = options;
  let lastError: Error | undefined;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError;
}

/**
 * Assert with custom error message
 */
export function assertWithMessage(
  condition: boolean, 
  message: string
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
