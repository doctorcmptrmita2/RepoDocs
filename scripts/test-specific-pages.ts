/**
 * Test Specific Pages - User reported issues
 * 
 * Tests the exact pages user mentioned having issues with
 */

async function testPage(url: string, name: string) {
  console.log(`\n📍 ${name}`);
  console.log(`   URL: ${url}`);
  console.log('─'.repeat(60));
  
  for (let i = 1; i <= 10; i++) {
    const start = performance.now();
    try {
      const res = await fetch(url, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
          'Accept': 'text/html,application/xhtml+xml',
        },
        redirect: 'follow',
      });
      const time = Math.round(performance.now() - start);
      const body = await res.text();
      const hasContent = body.length > 1000;
      
      const status = res.status === 200 && hasContent ? '✅' : 
                     res.status === 200 ? '⚠️ Empty' : `❌ ${res.status}`;
      const speed = time < 300 ? '🚀' : time < 1000 ? '🔥' : time < 3000 ? '🐢' : '🐌';
      
      console.log(`   ${i.toString().padStart(2)}: ${time.toString().padStart(5)}ms ${speed} ${status} (${(body.length/1024).toFixed(1)}KB)`);
    } catch (err: any) {
      const time = Math.round(performance.now() - start);
      console.log(`   ${i.toString().padStart(2)}: ${time.toString().padStart(5)}ms ❌ ERROR: ${err.message}`);
    }
    await new Promise(r => setTimeout(r, 200));
  }
}

async function main() {
  console.log('🔍 Testing Specific Pages User Reported Issues With\n');
  console.log('═'.repeat(60));
  
  // Custom domain pages
  await testPage('https://docs.agentwall.io/', 'Custom Domain - Homepage');
  await testPage('https://docs.agentwall.io/README', 'Custom Domain - README');
  await testPage('https://docs.agentwall.io/guide/getting-started', 'Custom Domain - Getting Started');
  
  // Dashboard settings (requires auth, will redirect)
  await testPage('https://repodocs.dev/dashboard/agentwall/settings', 'Dashboard - Agentwall Settings');
  
  // Main domain docs
  await testPage('https://repodocs.dev/docs/agentwall/main', 'Main Domain - Agentwall Docs');
  await testPage('https://repodocs.dev/docs/agentwall/main/README', 'Main Domain - Agentwall README');
  
  console.log('\n' + '═'.repeat(60));
  console.log('✅ Test Complete');
  console.log('═'.repeat(60));
}

main().catch(console.error);
