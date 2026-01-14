/**
 * RepoDocs Production Test Script
 * 
 * Tüm sayfaları ve API'leri test eder, rapor oluşturur.
 * 
 * Kullanım: npx ts-node scripts/production-test.ts
 */

const BASE_URL = 'https://repodocs.dev';
const CUSTOM_DOMAIN = 'https://docs.agentwall.io';

interface TestResult {
  url: string;
  status: number | 'ERROR';
  responseTime: number;
  success: boolean;
  error?: string;
}

const results: TestResult[] = [];

async function testUrl(url: string): Promise<TestResult> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout
    
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'RepoDocs-Test/1.0',
      },
    });
    
    clearTimeout(timeout);
    const responseTime = Date.now() - start;
    
    return {
      url,
      status: response.status,
      responseTime,
      success: response.status >= 200 && response.status < 400,
    };
  } catch (error: any) {
    return {
      url,
      status: 'ERROR',
      responseTime: Date.now() - start,
      success: false,
      error: error.message,
    };
  }
}

async function runTests() {
  console.log('🚀 RepoDocs Production Test Başlıyor...\n');
  console.log('=' .repeat(60));
  
  // ==================== ANA SAYFA TESTLERİ ====================
  console.log('\n📄 ANA SAYFA TESTLERİ\n');
  
  const mainPages = [
    `${BASE_URL}/`,
    `${BASE_URL}/login`,
    `${BASE_URL}/docs/repodocs/main`,
  ];
  
  for (const url of mainPages) {
    const result = await testUrl(url);
    results.push(result);
    printResult(result);
  }
  
  // ==================== DASHBOARD TESTLERİ ====================
  console.log('\n📊 DASHBOARD TESTLERİ (Login gerektirir - 302/401 beklenir)\n');
  
  const dashboardPages = [
    `${BASE_URL}/dashboard`,
    `${BASE_URL}/dashboard/agentwall`,
    `${BASE_URL}/dashboard/agentwall/settings`,
    `${BASE_URL}/dashboard/repodocs`,
    `${BASE_URL}/dashboard/repodocs/settings`,
    `${BASE_URL}/dashboard/new`,
  ];
  
  for (const url of dashboardPages) {
    const result = await testUrl(url);
    results.push(result);
    printResult(result);
  }
  
  // ==================== API TESTLERİ ====================
  console.log('\n🔌 API TESTLERİ\n');
  
  const apiEndpoints = [
    `${BASE_URL}/api/auth/providers`,
    `${BASE_URL}/api/auth/session`,
    `${BASE_URL}/api/search?q=test&project=agentwall`,
  ];
  
  for (const url of apiEndpoints) {
    const result = await testUrl(url);
    results.push(result);
    printResult(result);
  }
  
  // ==================== CUSTOM DOMAIN TESTLERİ ====================
  console.log('\n🌐 CUSTOM DOMAIN TESTLERİ (docs.agentwall.io)\n');
  
  const customDomainPages = [
    `${CUSTOM_DOMAIN}/`,
    `${CUSTOM_DOMAIN}/README`,
    `${CUSTOM_DOMAIN}/guide/getting-started`,
    `${CUSTOM_DOMAIN}/guide/concepts`,
    `${CUSTOM_DOMAIN}/api/overview`,
    `${CUSTOM_DOMAIN}/api/endpoints`,
    `${CUSTOM_DOMAIN}/api/errors`,
    `${CUSTOM_DOMAIN}/sdk/python`,
    `${CUSTOM_DOMAIN}/sdk/javascript`,
    `${CUSTOM_DOMAIN}/integrations/langchain`,
    `${CUSTOM_DOMAIN}/integrations/openai`,
    `${CUSTOM_DOMAIN}/playground/examples`,
    `${CUSTOM_DOMAIN}/playground/curl`,
    `${CUSTOM_DOMAIN}/admin/dashboard`,
    `${CUSTOM_DOMAIN}/admin/api-keys`,
    `${CUSTOM_DOMAIN}/admin/runs`,
    `${CUSTOM_DOMAIN}/admin/alerts`,
    `${CUSTOM_DOMAIN}/faq`,
    `${CUSTOM_DOMAIN}/changelog`,
  ];
  
  for (const url of customDomainPages) {
    const result = await testUrl(url);
    results.push(result);
    printResult(result);
  }
  
  // ==================== STATIC ASSETS TESTLERİ ====================
  console.log('\n📦 STATIC ASSETS TESTLERİ\n');
  
  const staticAssets = [
    `${BASE_URL}/favicon.ico`,
    `${BASE_URL}/_next/static/chunks/webpack.js`,
  ];
  
  for (const url of staticAssets) {
    const result = await testUrl(url);
    results.push(result);
    printResult(result);
  }
  
  // ==================== PERFORMANS TESTLERİ ====================
  console.log('\n⚡ PERFORMANS TESTLERİ (Aynı sayfa 5 kez)\n');
  
  const perfUrls = [
    `${BASE_URL}/`,
    `${CUSTOM_DOMAIN}/README`,
  ];
  
  for (const url of perfUrls) {
    const times: number[] = [];
    for (let i = 0; i < 5; i++) {
      const result = await testUrl(url);
      times.push(result.responseTime);
      results.push(result);
    }
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    console.log(`  ${url}`);
    console.log(`    Min: ${min}ms | Max: ${max}ms | Avg: ${avg.toFixed(0)}ms\n`);
  }
  
  // ==================== RAPOR ====================
  printReport();
}

function printResult(result: TestResult) {
  const icon = result.success ? '✅' : '❌';
  const status = result.status === 'ERROR' ? 'ERR' : result.status;
  const time = `${result.responseTime}ms`.padStart(6);
  console.log(`  ${icon} [${status}] ${time} - ${result.url}`);
  if (result.error) {
    console.log(`     └─ Error: ${result.error}`);
  }
}

function printReport() {
  console.log('\n' + '=' .repeat(60));
  console.log('📋 TEST RAPORU\n');
  
  const total = results.length;
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const avgTime = results.reduce((a, b) => a + b.responseTime, 0) / total;
  
  console.log(`  Toplam Test: ${total}`);
  console.log(`  ✅ Başarılı: ${passed}`);
  console.log(`  ❌ Başarısız: ${failed}`);
  console.log(`  ⏱️  Ortalama Süre: ${avgTime.toFixed(0)}ms`);
  
  // Yavaş sayfalar
  const slowPages = results
    .filter(r => r.responseTime > 3000)
    .sort((a, b) => b.responseTime - a.responseTime);
  
  if (slowPages.length > 0) {
    console.log('\n  ⚠️  YAVAŞ SAYFALAR (>3s):');
    slowPages.forEach(r => {
      console.log(`     - ${r.url} (${r.responseTime}ms)`);
    });
  }
  
  // Başarısız sayfalar
  const failedPages = results.filter(r => !r.success);
  if (failedPages.length > 0) {
    console.log('\n  ❌ BAŞARISIZ SAYFALAR:');
    failedPages.forEach(r => {
      console.log(`     - [${r.status}] ${r.url}`);
      if (r.error) console.log(`       └─ ${r.error}`);
    });
  }
  
  console.log('\n' + '=' .repeat(60));
  
  // Sonuç
  const successRate = (passed / total * 100).toFixed(1);
  if (failed === 0) {
    console.log(`\n🎉 TÜM TESTLER BAŞARILI! (${successRate}%)\n`);
  } else {
    console.log(`\n⚠️  ${failed} TEST BAŞARISIZ (${successRate}% başarı)\n`);
  }
}

// Run
runTests().catch(console.error);
