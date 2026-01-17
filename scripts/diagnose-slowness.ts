/**
 * Diagnose Slowness Script
 * 
 * Tests various endpoints multiple times to identify intermittent issues
 */

const BASE_URL = 'https://repodocs.dev';

interface TestResult {
  url: string;
  attempt: number;
  status: number;
  responseTime: number;
  error?: string;
}

async function testEndpoint(url: string, attempt: number): Promise<TestResult> {
  const startTime = performance.now();
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RepoDocs-Diagnostic/1.0',
      },
    });
    
    const responseTime = performance.now() - startTime;
    
    return {
      url,
      attempt,
      status: response.status,
      responseTime: Math.round(responseTime),
    };
  } catch (error) {
    const responseTime = performance.now() - startTime;
    return {
      url,
      attempt,
      status: 0,
      responseTime: Math.round(responseTime),
      error: (error as Error).message,
    };
  }
}

async function runDiagnostics() {
  console.log('🔍 RepoDocs Slowness Diagnostic\n');
  console.log('Testing endpoints multiple times to identify intermittent issues...\n');
  
  const endpoints = [
    '/',                           // Homepage
    '/api/health',                 // Health check
    '/login',                      // Login page
    '/docs/repodocs/main',         // Docs index
    '/docs/agentwall/main',        // Another project docs
  ];
  
  const results: TestResult[] = [];
  const ATTEMPTS = 5;
  
  for (const endpoint of endpoints) {
    const url = `${BASE_URL}${endpoint}`;
    console.log(`\n📍 Testing: ${endpoint}`);
    console.log('-'.repeat(50));
    
    const endpointResults: TestResult[] = [];
    
    for (let i = 1; i <= ATTEMPTS; i++) {
      const result = await testEndpoint(url, i);
      endpointResults.push(result);
      results.push(result);
      
      const status = result.error 
        ? `❌ ERROR: ${result.error}` 
        : result.status === 200 
          ? '✅' 
          : `⚠️ ${result.status}`;
      
      const speed = result.responseTime < 500 
        ? '🚀' 
        : result.responseTime < 2000 
          ? '🐢' 
          : '🐌';
      
      console.log(`  Attempt ${i}: ${result.responseTime}ms ${speed} ${status}`);
      
      // Small delay between requests
      await new Promise(r => setTimeout(r, 500));
    }
    
    // Calculate stats for this endpoint
    const times = endpointResults.map(r => r.responseTime);
    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    const min = Math.min(...times);
    const max = Math.max(...times);
    const errors = endpointResults.filter(r => r.error || r.status !== 200).length;
    
    console.log(`  📊 Avg: ${avg}ms | Min: ${min}ms | Max: ${max}ms | Errors: ${errors}/${ATTEMPTS}`);
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 SUMMARY');
  console.log('='.repeat(60));
  
  const totalTests = results.length;
  const totalErrors = results.filter(r => r.error || r.status !== 200).length;
  const avgTime = Math.round(results.reduce((a, b) => a + b.responseTime, 0) / totalTests);
  const slowRequests = results.filter(r => r.responseTime > 2000).length;
  
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Errors: ${totalErrors} (${Math.round(totalErrors/totalTests*100)}%)`);
  console.log(`Average Response Time: ${avgTime}ms`);
  console.log(`Slow Requests (>2s): ${slowRequests} (${Math.round(slowRequests/totalTests*100)}%)`);
  
  // Identify problematic endpoints
  const problemEndpoints = endpoints.filter(ep => {
    const epResults = results.filter(r => r.url.endsWith(ep));
    const errorRate = epResults.filter(r => r.error || r.status !== 200).length / epResults.length;
    const avgTime = epResults.reduce((a, b) => a + b.responseTime, 0) / epResults.length;
    return errorRate > 0.2 || avgTime > 2000;
  });
  
  if (problemEndpoints.length > 0) {
    console.log('\n⚠️ Problematic Endpoints:');
    problemEndpoints.forEach(ep => console.log(`  - ${ep}`));
  } else {
    console.log('\n✅ All endpoints performing well!');
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  
  if (slowRequests > totalTests * 0.3) {
    console.log('  - High percentage of slow requests detected');
    console.log('  - Consider increasing server resources');
    console.log('  - Check for cold start issues (serverless)');
  }
  
  if (totalErrors > 0) {
    console.log('  - Some requests failed');
    console.log('  - Check server logs for errors');
    console.log('  - Verify database/Redis connections');
  }
  
  const variance = Math.max(...results.map(r => r.responseTime)) - Math.min(...results.map(r => r.responseTime));
  if (variance > 3000) {
    console.log('  - High variance in response times detected');
    console.log('  - This suggests intermittent issues');
    console.log('  - Possible causes: cold starts, connection pool exhaustion, or resource contention');
  }
}

runDiagnostics().catch(console.error);
