/**
 * Authentication Setup for Playwright Tests
 * 
 * This file sets up authenticated state for tests that require login
 */

import { chromium, FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const AUTH_FILE = path.join(__dirname, 'auth-state.json');

// Session cookies from production
const SESSION_COOKIES = [
  {
    name: '__Secure-next-auth.session-token',
    value: '2cf4ac13-c4a9-45af-8bb3-32f7d21edf7e',
    domain: 'repodocs.dev',
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'Lax' as const,
  },
  {
    name: '__Host-next-auth.csrf-token',
    value: '09b70d3c6855c439990d45b642e90f48fa15316d20f666f651fea017712f26b4%7C43b3ea10a53b127a9e73501c9e7872672701725e109766e3ddb2a3ce3cf3bb50',
    domain: 'repodocs.dev',
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'Lax' as const,
  },
  {
    name: '__Secure-next-auth.callback-url',
    value: 'https%3A%2F%2Frepodocs.dev%2Fdashboard',
    domain: 'repodocs.dev',
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'Lax' as const,
  },
];

/**
 * Setup authentication state
 */
async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  
  // Add session cookies
  await context.addCookies(SESSION_COOKIES);
  
  // Save storage state
  await context.storageState({ path: AUTH_FILE });
  
  await browser.close();
  
  console.log('✅ Auth state saved to', AUTH_FILE);
}

export default globalSetup;
export { AUTH_FILE, SESSION_COOKIES };
