/**
 * RepoDocs Stress Test & Bug Finder
 * 
 * Tüm endpoint'leri test eder, yavaş olanları bulur, hataları raporlar.
 * 
 * Kullanım: npx ts-node scripts/stress-test.ts
 */

const BASE_URL = process.env.TEST_URL || 'https://repodocs.dev';
const CONCURRENT_REQUESTS = 10;
const TIMEOUT_MS = 30000;

interface TestResult {
  url: string;
  method: string;
  status: number | 'TIMEOUT' | 'ERROR';
  responseTime: number;
  success: boolean;
  error?: string;
  size?: number;
}

const results: TestResult[] = [];
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

async function testEndpoint(url: string, method: string = 'GET', options: RequestInit = {}): Promise<TestResult> {
  const start = Date.now();
  totalTests++;
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    const response = await fetch(url, {
      method,
      signal: controller.signal,
      headers: {
        'User-Agent': 'RepoDocs-StressTest/1.0',
        ...options.headers,
      },
      ...options,
    });
    
    clearTimeout(timeout);
    const responseTime = Date.now() - start;
    const text = await response.text();
    
    const success = response.status >= 200 && response.status < 400;
    if (success) passedTests++;
    else failedTests++;
    
    return {
      url,
      method,
      status: response.status,
      responseTime,
      success,
      size: text.length,
    };
  } catch (error: any) {
    failedTests++;
    const responseTime = Date.now() - start;
    
    if (error.name === 'AbortError') {
      return {
        url,
        method,
        status: 'TIMEOUT',
        responseTime,
        success: false,
        error: `Timeout after ${TIMEOUT_MS}ms`,
      };
    }
    
    return {
      url,
      method,
      status: 'ERROR',
      responseTime,
      success: false,
      error: error.message,
    };
  }
}

function printResult(result: TestResult) {
  const icon = result.success ? '✅' : '❌';
  const status = typeof result.status === 'number' ? result.status : result.status;
  const time = `${result.responseTime}ms`.padStart(7);
  const size = result.size ? `${(result.size / 1024).toFixed(1)}KB` : '';
  
  let color = '';
  if (result.responseTime > 5000) color = '🔴';
  else if (result.responseTime > 2000) color = '🟡';
  else if (result.responseTime > 500) color = '🟢';
  else color = '⚡';
  
  console.log(`${icon} [${status}] ${color} ${time} ${size.padStart(8)} - ${result.url}`);
  if (result.error) {
    console.log(`   └─ Error: ${result.error}`);
  }
}

async function runTestBatch(urls: string[], label: string) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📋 ${label}`);
  console.log('='.repeat(70));
  
  for (const url of urls) {
    const result = await testEndpoint(url);
    results.push(result);
    printResult(result);
  }
}

async function runConcurrentTest(url: string, count: number, label: string) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`⚡ ${label} (${count} concurrent requests)`);
  console.log('='.repeat(70));
  
  const promises = Array(count).fill(null).map(() => testEndpoint(url));
  const batchResults = await Promise.all(promises);
  
  const times = batchResults.map(r => r.responseTime);
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  const failed = batchResults.filter(r => !r.success).length;
  
  console.log(`  URL: ${url}`);
  console.log(`  Min: ${min}ms | Max: ${max}ms | Avg: ${avg.toFixed(0)}ms`);
  console.log(`  Success: ${count - failed}/${count} | Failed: ${failed}`);
  
  batchResults.forEach(r => results.push(r));
  
  return { avg, min, max, failed };
}

async function main() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║           🔥 RepoDocs Production Stress Test 🔥                      ║');
  console.log('║                                                                      ║');
  console.log(`║  Target: ${BASE_URL.padEnd(58)}║`);
  console.log(`║  Timeout: ${TIMEOUT_MS}ms                                                    ║`);
  console.log('╚══════════════════════════════════════════════════════════════════════╝');

  // ==================== 1. HEALTH CHECK ====================
  await runTestBatch([
    `${BASE_URL}/api/health`,
    `${BASE_URL}/api/debug`,
  ], '1. HEALTH CHECK');

  // ==================== 2. PUBLIC PAGES ====================
  await runTestBatch([
    `${BASE_URL}/`,
    `${BASE_URL}/login`,
    `${BASE_URL}/docs/repodocs/main`,
    `${BASE_URL}/docs/repodocs/main/getting-started`,
  ], '2. PUBLIC PAGES');

  // ==================== 3. AUTH ENDPOINTS ====================
  await runTestBatch([
    `${BASE_URL}/api/auth/providers`,
    `${BASE_URL}/api/auth/session`,
    `${BASE_URL}/api/auth/csrf`,
  ], '3. AUTH ENDPOINTS');

  // ==================== 4. DASHBOARD (Auth Required) ====================
  await runTestBatch([
    `${BASE_URL}/dashboard`,
    `${BASE_URL}/dashboard/repodocs`,
    `${BASE_URL}/dashboard/repodocs/settings`,
    `${BASE_URL}/dashboard/agentwall`,
    `${BASE_URL}/dashboard/agentwall/settings`,
    `${BASE_URL}/dashboard/new`,
  ], '4. DASHBOARD PAGES (May redirect to login)');

  // ==================== 5. API ENDPOINTS ====================
  await runTestBatch([
    `${BASE_URL}/api/projects/repodocs`,
    `${BASE_URL}/api/projects/agentwall`,
    `${BASE_URL}/api/search?q=test&project=repodocs`,
  ], '5. API ENDPOINTS');

  // ==================== 6. CUSTOM DOMAIN ====================
  await runTestBatch([
    'https://docs.agentwall.io/',
    'https://docs.agentwall.io/README',
    'https://docs.agentwall.io/guide/getting-started',
    'https://docs.agentwall.io/guide/concepts',
    'https://docs.agentwall.io/playground/examples',
  ], '6. CUSTOM DOMAIN (docs.agentwall.io)');

  // ==================== 7. STATIC ASSETS ====================
  await runTestBatch([
    `${BASE_URL}/favicon.ico`,
  ], '7. STATIC ASSETS');

  // ==================== 8. CONCURRENT LOAD TEST ====================
  await runConcurrentTest(`${BASE_URL}/`, 10, '8. HOMEPAGE LOAD TEST');
  await runConcurrentTest(`${BASE_URL}/api/health`, 10, '9. API HEALTH LOAD TEST');
  await runConcurrentTest('https://docs.agentwall.io/README', 10, '10. DOCS LOAD TEST');

  // ==================== 9. SEQUENTIAL STRESS TEST ====================
  console.log(`\n${'='.repeat(70)}`);
  console.log('🔄 11. SEQUENTIAL STRESS TEST (Same page 20 times)');
  console.log('='.repeat(70));
  
  const stressUrl = `${BASE_URL}/dashboard`;
  const stressTimes: number[] = [];
  
  for (let i = 0; i < 20; i++) {
    const result = await testEndpoint(stressUrl);
    results.push(result);
    stressTimes.push(result.responseTime);
    process.stdout.write(`  Request ${i + 1}/20: ${result.responseTime}ms ${result.success ? '✅' : '❌'}\r`);
  }
  
  console.log('\n');
  console.log(`  Min: ${Math.min(...stressTimes)}ms`);
  console.log(`  Max: ${Math.max(...stressTimes)}ms`);
  console.log(`  Avg: ${(stressTimes.reduce((a, b) => a + b, 0) / stressTimes.length).toFixed(0)}ms`);
  console.log(`  Variance: ${(Math.max(...stressTimes) - Math.min(...stressTimes))}ms`);

  // ==================== FINAL REPORT ====================
  printFinalReport();
}

function printFinalReport() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║                        📊 FINAL REPORT                               ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');
  
  console.log(`\n  📈 SUMMARY`);
  console.log(`  ─────────────────────────────────`);
  console.log(`  Total Tests:    ${totalTests}`);
  console.log(`  Passed:         ${passedTests} (${(passedTests/totalTests*100).toFixed(1)}%)`);
  console.log(`  Failed:         ${failedTests} (${(failedTests/totalTests*100).toFixed(1)}%)`);
  
  const avgTime = results.reduce((a, b) => a + b.responseTime, 0) / results.length;
  console.log(`  Avg Response:   ${avgTime.toFixed(0)}ms`);
  
  // Slow requests
  const slowRequests = results.filter(r => r.responseTime > 3000);
  if (slowRequests.length > 0) {
    console.log(`\n  🐌 SLOW REQUESTS (>3s): ${slowRequests.length}`);
    console.log(`  ─────────────────────────────────`);
    slowRequests
      .sort((a, b) => b.responseTime - a.responseTime)
      .slice(0, 10)
      .forEach(r => {
        console.log(`  ${r.responseTime}ms - ${r.url}`);
      });
  }
  
  // Failed requests
  const failedRequests = results.filter(r => !r.success);
  if (failedRequests.length > 0) {
    console.log(`\n  ❌ FAILED REQUESTS: ${failedRequests.length}`);
    console.log(`  ─────────────────────────────────`);
    failedRequests.forEach(r => {
      console.log(`  [${r.status}] ${r.url}`);
      if (r.error) console.log(`       └─ ${r.error}`);
    });
  }
  
  // Timeouts
  const timeouts = results.filter(r => r.status === 'TIMEOUT');
  if (timeouts.length > 0) {
    console.log(`\n  ⏰ TIMEOUTS: ${timeouts.length}`);
    console.log(`  ─────────────────────────────────`);
    timeouts.forEach(r => {
      console.log(`  ${r.url}`);
    });
  }
  
  // Performance by endpoint type
  console.log(`\n  📊 PERFORMANCE BY TYPE`);
  console.log(`  ─────────────────────────────────`);
  
  const apiResults = results.filter(r => r.url.includes('/api/'));
  const pageResults = results.filter(r => !r.url.includes('/api/') && !r.url.includes('.'));
  const docsResults = results.filter(r => r.url.includes('docs.agentwall.io'));
  
  if (apiResults.length > 0) {
    const apiAvg = apiResults.reduce((a, b) => a + b.responseTime, 0) / apiResults.length;
    console.log(`  API Endpoints:  ${apiAvg.toFixed(0)}ms avg (${apiResults.length} tests)`);
  }
  
  if (pageResults.length > 0) {
    const pageAvg = pageResults.reduce((a, b) => a + b.responseTime, 0) / pageResults.length;
    console.log(`  Pages:          ${pageAvg.toFixed(0)}ms avg (${pageResults.length} tests)`);
  }
  
  if (docsResults.length > 0) {
    const docsAvg = docsResults.reduce((a, b) => a + b.responseTime, 0) / docsResults.length;
    console.log(`  Custom Domain:  ${docsAvg.toFixed(0)}ms avg (${docsResults.length} tests)`);
  }
  
  // Verdict
  console.log(`\n  🎯 VERDICT`);
  console.log(`  ─────────────────────────────────`);
  
  if (failedTests === 0 && slowRequests.length === 0) {
    console.log(`  ✅ ALL SYSTEMS OPERATIONAL`);
  } else if (failedTests > totalTests * 0.1) {
    console.log(`  🔴 CRITICAL: High failure rate (${(failedTests/totalTests*100).toFixed(1)}%)`);
  } else if (slowRequests.length > 5) {
    console.log(`  🟡 WARNING: Multiple slow endpoints detected`);
  } else if (timeouts.length > 0) {
    console.log(`  🔴 CRITICAL: Timeout issues detected`);
  } else {
    console.log(`  🟢 MOSTLY HEALTHY with minor issues`);
  }
  
  console.log('\n');
}

// Run
main().catch(console.error);
