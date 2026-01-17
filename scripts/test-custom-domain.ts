/**
 * Custom Domain Diagnostic Script
 */

const BASE_URL = 'https://docs.agentwall.io';

async function testCustomDomain() {
  console.log('🔍 Custom Domain Diagnostic: docs.agentwall.io\n');
  
  const endpoints = ['/', '/README'];
  
  for (const endpoint of endpoints) {
    const url = `${BASE_URL}${endpoint}`;
    console.log(`\n📍 Testing: ${url}`);
    console.log('-'.repeat(50));
    
    for (let i = 1; i <= 5; i++) {
      const start = performance.now();
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Diagnostic/1.0' },
          redirect: 'follow'
        });
        const time = Math.round(performance.now() - start);
        const status = res.status === 200 ? '✅' : `⚠️ ${res.status}`;
        const speed = time < 500 ? '🚀' : time < 2000 ? '🐢' : '🐌';
        console.log(`  Attempt ${i}: ${time}ms ${speed} ${status}`);
      } catch (err: any) {
        const time = Math.round(performance.now() - start);
        console.log(`  Attempt ${i}: ${time}ms ❌ ERROR: ${err.message}`);
      }
      await new Promise(r => setTimeout(r, 300));
    }
  }
}

testCustomDomain().catch(console.error);
