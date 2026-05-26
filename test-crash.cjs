const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Capture page errors
  page.on('pageerror', error => {
    console.error('[PAGE ERROR]', error.message);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('[CONSOLE ERROR]', msg.text());
    }
  });

  try {
    await page.goto('http://localhost:8081/login');
    // Set token to bypass login
    await page.evaluate(() => {
      localStorage.setItem('gc_token', 'dummy_token');
    });
    
    // Go to Tax Center
    await page.goto('http://localhost:8081/tax-center');
    await page.waitForTimeout(2000);
    
    console.log("Done checking tax center.");
  } catch (err) {
    console.error("Test error:", err);
  } finally {
    await browser.close();
  }
})();
