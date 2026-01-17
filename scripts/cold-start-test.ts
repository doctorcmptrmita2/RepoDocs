/**
 * Cold Start & Intermittent Issue Detector
 * 
 * Tests endpoints with delays to detect cold start issues
 */

const CUSTOM_DOMAIN = 'https://docs.agentwall.io';
const MAIN_DOMAIN = 'https://repodocs.dev';

interface TestResult {
  url: string;
  attempt: number;
  responseTime: number;
  status: number | string;
  isColdStart: boolean;
}

async function testWithDelay(url: string, delaySeconds: number): Promise<TestResult> {
  if (delaySeconds > 0) {
    console.log(`  ⏳ Waiting ${delaySeconds}s to simulate idle...`);
    await new Promise(r => setTimeout(r, delaySeconds * 1000));
  }
  
  const start = performance.now();
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'ColdStartTest/1.0' },
    });
    const time = Math.round(performance.now() - start);
    return {
      url,
      attempt: delaySeconds,
      responseTime: time,
      status: res.status,
      isColdStart: time > 1000, // >1s suggests cold start
    };
  } catch (err: any) {
    const time = Math.round(performance.now() - start);
    return {
      url,
      attempt: delaySeconds,
      responseTime: time,
      status: err.message,
      isColdStart: false,
    };
  }
}

async function runColdStartTest() {
  console.log('🧊 Cold Start & Intermittent Issue Detector\n');
  console.log('Testing with various delays to detect cold start patterns...\n');
  
  const results: TestResult[] = [];
  
  // Test custom domain with increasing delays
  console.log('📍 Testing Custom Domain: docs.agentwall.io');
  console.log('─'.repeat(50));
  
  // Warm up request
  const warmup = await testWithDelay(`${CUSTOM_DOMAIN}/README`, 0);
  console.log(`  Warmup: ${warmup.responseTime}ms ${warmup.status === 200 ? '✅' : '❌'}`);
  results.push(warmup);
  
  // Test with delays
  const delays = [0, 0, 0, 5, 10, 15, 20, 30];
  for (const delay of delays) {
    const result = await testWithDelay(`${CUSTOM_DOMAIN}/README`, delay);
    const icon = result.isColdStart ? '🧊' : '🔥';
    const status = result.status === 200 ? '✅' : `❌ ${result.status}`;
    console.log(`  After ${delay}s: ${result.responseTime}ms ${icon} ${status}`);
    results.push(result);
  }
  
  // Test main domain
  console.log('\n📍 Testing Main Domain: repodocs.dev');
  console.log('─'.repeat(50));
  
  const mainWarmup = await testWithDelay(`${MAIN_DOMAIN}/docs/agentwall/main/README`, 0);
  console.log(`  Warmup: ${mainWarmup.responseTime}ms ${mainWarmup.status === 200 ? '✅' : '❌'}`);
  results.push(mainWarmup);
  
  for (const delay of [0, 0, 5, 10]) {
    const result = await testWithDelay(`${MAIN_DOMAIN}/docs/agentwall/main/README`, delay);
    const icon = result.isColdStart ? '🧊' : '🔥';
    const status = result.status === 200 ? '✅' : `❌ ${result.status}`;
    console.log(`  After ${delay}s: ${result.responseTime}ms ${icon} ${status}`);
    results.push(result);
  }
  
  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('📊 ANALYSIS');
  console.log('═'.repeat(50));
  
  const coldStarts = results.filter(r => r.isColdStart);
  const errors = results.filter(r => typeof r.status === 'string' || r.status !== 200);
  const avgTime = Math.round(results.reduce((a, b) => a + b.responseTime, 0) / results.length);
  const maxTime = Math.max(...results.map(r => r.responseTime));
  const minTime = Math.min(...results.map(r => r.responseTime));
  
  console.log(`\nTotal Tests: ${results.length}`);
  console.log(`Cold Starts (>1s): ${coldStarts.length}`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Response Times: Min ${minTime}ms | Avg ${avgTime}ms | Max ${maxTime}ms`);
  
  if (coldStarts.length > 0) {
    console.log('\n⚠️ Cold start issues detected!');
    console.log('Recommendations:');
    console.log('  1. Enable keep-alive on Easypanel');
    console.log('  2. Set up health check ping every 5 minutes');
    console.log('  3. Increase container memory/CPU');
  }
  
  if (errors.length > 0) {
    console.log('\n❌ Errors detected:');
    errors.forEach(e => console.log(`  - ${e.url}: ${e.status}`));
  }
  
  if (coldStarts.length === 0 && errors.length === 0) {
    console.log('\n✅ No cold start or intermittent issues detected!');
    console.log('If user still experiences issues, check:');
    console.log('  1. User\'s network/ISP');
    console.log('  2. Browser cache issues');
    console.log('  3. DNS propagation for custom domain');
  }
}

runColdStartTest().catch(console.error);
